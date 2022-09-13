import type { RequestHandler } from '@sveltejs/kit';

import { prisma } from '$root/lib/database';

import type { ApiError } from '$root/types/api';

const DISCORD_ROLE_ADD_EP = import.meta.env.VITE_DISCORD_ROLE_ADD_EP;
const MESHER_TOKEN = import.meta.env.VITE_MESHER_TOKEN;

export const POST: RequestHandler = async ({ request }) => {
	const { discordUserId, klaytnEoaAddress } = await request.json();

	let roleError: ApiError | null = null;
	let role = 'member';

	const userByKlaytnEoaAddress = await prisma.discord_user.findUnique({
		where: { klaytnEoaAddress }
	});
	const userByDiscordUserId = await prisma.discord_user.findUnique({
		where: { discordUserId }
	});

	if (userByKlaytnEoaAddress) {
		if (userByKlaytnEoaAddress.role === 'mfc') {
			roleError = { errorDescription: '이미 검증한 지갑주소입니다' };
			return new Response(JSON.stringify({ roleError }), {
				status: 500
			});
		} else if (
			userByKlaytnEoaAddress.role === 'member' &&
			userByKlaytnEoaAddress.discordUserId !== discordUserId
		) {
			roleError = { errorDescription: '검증에 사용한 지갑주소입니다' };
			return new Response(JSON.stringify({ roleError }), {
				status: 500
			});
		}
	} else if (userByDiscordUserId) {
		if (userByDiscordUserId.role === 'mfc') {
			roleError = { errorDescription: '이미 다른 지갑으로 검증한 디스코드 아이디입니다' };
			return new Response(JSON.stringify({ roleError }), {
				status: 500
			});
		} else {
			roleError = {
				errorDescription: `이미 다른 지갑으로 검증 중인 디스코드 아이디입니다. ${userByDiscordUserId.klaytnEoaAddress.substring(
					0,
					8
				)}... 지갑으로 검증 진행해주세요.`
			};
			return new Response(JSON.stringify({ roleError }), {
				status: 500
			});
		}
	} else {
		await prisma.discord_user.create({
			data: {
				discordUserId,
				klaytnEoaAddress,
				role
			}
		});
	}

	// Add new role of Discord
	const botClientResponse = await fetch(DISCORD_ROLE_ADD_EP, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ discordUserId, MESHER_TOKEN })
	});

	try {
		const { hasAdded, errors } = await botClientResponse.json();

		if (errors) console.debug('Backend:', errors);

		if (!hasAdded) {
			roleError = {
				errorDescription:
					'디스코드 역할 부여 중 에러가 발생했습니다. <comverser@mesher.io>로 문의하여주세요.'
			};
			return new Response(JSON.stringify({ roleError }), {
				status: 500
			});
		}
	} catch (err) {
		// Unknown error occurrs but it works propery
		console.debug('Unknown error:', err);
	}

	role = 'mfc';

	await prisma.discord_user.update({
		where: { klaytnEoaAddress },
		data: { role }
	});

	return new Response(JSON.stringify({ roleError }), {
		status: 200
	});
};
