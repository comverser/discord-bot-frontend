import { error } from '@sveltejs/kit';

import type { ApiError, WalletData } from '$root/types/api';

const getWalletInfo = async (
	klaytnCaAddress: string,
	klaytnEoaAddress: string
): Promise<WalletData | undefined> => {
	try {
		const url = '/wallet/info';
		const walletResponse = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ klaytnCaAddress, klaytnEoaAddress })
		});

		return await walletResponse.json();
	} catch (err: any) {
		throw error(400, `Failed to get wallet info: ${err.message}`);
	}
};

type CheckBalance = {
	hasBalance: boolean;
	kasPublicNodeError: ApiError;
};

export const checkBalance = async (klaytnEoaAddress: string): Promise<CheckBalance> => {
	const KLAYTN_CAP_NFT_ENTER = import.meta.env.VITE_KLAYTN_CAP_NFT_ENTER;
	const KLAYTN_CAP_NFT_ENTER_LP = import.meta.env.VITE_KLAYTN_CAP_NFT_ENTER_LP;
	let hasBalance = false;
	let kasPublicNodeError: ApiError | null = null;

	try {
		// Get wallet information
		const walletDataEnter: WalletData | undefined = await getWalletInfo(
			KLAYTN_CAP_NFT_ENTER,
			klaytnEoaAddress
		);
		const walletDataEnterLp: WalletData | undefined = await getWalletInfo(
			KLAYTN_CAP_NFT_ENTER_LP,
			klaytnEoaAddress
		);

		// Check balance
		if (walletDataEnter!.balance > 0 || walletDataEnterLp!.balance > 0) hasBalance = true;
		console.debug('ENTER:', walletDataEnter);
		console.debug('ENTER LP:', walletDataEnterLp);
	} catch (err: any) {
		kasPublicNodeError = {
			error: err.message,
			errorDescription:
				'죄송합니다!<br />현재 이용자가 많아 이용이 불가합니다<br />관리자에게 지갑주소를 알려주시면 처리해 드리겠습니다<br />관리자 연락처 : comverser@mesher.io',
			code: err.status
		};
	}
	return { hasBalance, kasPublicNodeError };
};
