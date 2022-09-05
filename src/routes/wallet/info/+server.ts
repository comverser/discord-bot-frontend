import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

import type { WalletData } from '$root/types/api';
import { caver } from '$root/lib/caver';

export const POST: RequestHandler = async ({ request }) => {
	const { klaytnCaAddress, klaytnEoaAddress } = await request.json();

	try {
		const kip17 = await caver.kct.kip17.create(klaytnCaAddress);

		const name = await kip17.name();
		const symbol = await kip17.symbol();
		const balance = Number(await kip17.balanceOf(klaytnEoaAddress));
		const totalSupply = Number(await kip17.totalSupply());

		const walletData: WalletData = { name, symbol, balance, totalSupply };

		return new Response(JSON.stringify(walletData), {
			status: 200
		});
	} catch (err) {
		throw error(400, `Have trouble with Klaytn call: ${err}`);
	}
};
