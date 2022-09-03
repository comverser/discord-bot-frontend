import { error } from '@sveltejs/kit';

type AddDiscordRole = {
	hasAdded: boolean;
	errors: {
		message: string;
	};
};

export const addDiscordRole = async (discordUserId: string): Promise<AddDiscordRole> => {
	try {
		const addRoleResponse = await fetch('/role', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ discordUserId })
		});

		return await addRoleResponse.json();
	} catch (err: any) {
		throw error(400, `Failed to add Discord role: ${err.message}`);
	}
};
