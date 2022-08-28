import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

import type { ApiError } from '$root/types/api';

/** @type {import('./$types').PageServerLoad} */
export const load: ServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code');

	if (code === null) {
		throw error(400, 'Empty query string parameter');
	}

	try {
		const oauthUrl = 'https://discord.com/api/oauth2/token';
		const tokenResponseData = await fetch(oauthUrl, {
			method: 'POST',
			body: new URLSearchParams({
				client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
				client_secret: import.meta.env.VITE_DISCORD_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: import.meta.env.VITE_DISCORD_REDIRECT_URI,
				scope: 'identify'
			}),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		const oauthData = await tokenResponseData.json();
		if (oauthData.error !== undefined) {
			return {
				error: oauthData.error,
				code: 401,
				errorDescription: oauthData.error_description
			} as ApiError;
		}

		const userUrl = 'https://discord.com/api/users/@me';
		const userResult = await fetch(userUrl, {
			headers: {
				authorization: `${oauthData.token_type} ${oauthData.access_token}`
			}
		});
		const userData = await userResult.json();
		if (userData.id === undefined || userData.id === null) {
			throw error(400, 'Cannot fetch user data');
		}

		return userData;
	} catch (err: any) {
		// NOTE: An unauthorized token will not throw an error
		// tokenResponseData.statusCode will be 401

		throw error(err.status, `Exception occurred: ${err.message}`);
	}
};
