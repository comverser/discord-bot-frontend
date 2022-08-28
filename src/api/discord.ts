import { error } from '@sveltejs/kit';

const DISCORD_ROLE_ASSIGN_EP = import.meta.env.VITE_DISCORD_ROLE_ASSIGN_EP;
const MESHER_TOKEN = import.meta.env.VITE_MESHER_TOKEN;

export const assignDiscordRole = async (discordUserId: string): Promise<boolean> => {
	try {
		const discordResponse = await fetch(DISCORD_ROLE_ASSIGN_EP, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ discordUserId, MESHER_TOKEN })
		});

		return await discordResponse.json();
	} catch (err: any) {
		throw error(400, `Failed to assign Discord role: ${err.message}`);
	}
};
