import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const DISCORD_ROLE_ADD_EP = import.meta.env.VITE_DISCORD_ROLE_ADD_EP;
const MESHER_TOKEN = import.meta.env.VITE_MESHER_TOKEN;

export const POST: RequestHandler = async ({ request }) => {
	const { discordUserId } = await request.json();

	try {
		const botClientResponse = await fetch(DISCORD_ROLE_ADD_EP, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ discordUserId, MESHER_TOKEN })
		});

		const addRoleResult = await botClientResponse.json();

		return new Response(JSON.stringify(addRoleResult), {
			status: 200
		});
	} catch (err) {
		throw error(400, `Failed to add Discord role: ${err}`);
	}
};
