import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

import { caver } from '$root/lib/caver';

export const POST: RequestHandler = async ({ request }) => {
	const { signature, message, klaytnEoaAddress } = await request.json();

	try {
		const hasValidated = await caver.validator.validateSignedMessage(
			message,
			signature,
			klaytnEoaAddress
		);

		return new Response(JSON.stringify({ hasValidated }), {
			status: 200
		});
	} catch (err) {
		throw error(400, `Signature validation failed: ${err}`);
	}
};
