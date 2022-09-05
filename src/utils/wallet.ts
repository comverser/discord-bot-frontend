import { error } from '@sveltejs/kit';

import type { WalletData } from '$root/types/api';

const handleError = (err: any) => {
	if (err.code === -32603) {
		throw error(400, `User denied: ${err.message}`);
	}
};

export const connectWallet = async (kaikasProvider: any): Promise<string> => {
	try {
		const accounts = await kaikasProvider.enable();
		// You now have an array of accounts!

		if (kaikasProvider.selectedAddress === undefined) {
			console.warn('Account selected is undefined, first account is selected arbitrarily');
			return accounts[0];
		}
		return kaikasProvider.selectedAddress;
	} catch (err: any) {
		handleError(err);
		throw error(400, `Failed to connect wallet: ${err.message}`);
	}
};

export const getWalletInfo = async (
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

export const signWallet = async (klaytnEoaAddress: string, message: string) => {
	try {
		const Caver = (window as any).Caver;
		const caver = new Caver((window as any).klaytn);

		const signedMessage = await caver.rpc.klay.sign(klaytnEoaAddress, message);
		const v = `0x` + signedMessage.substring(2).substring(128, 130);
		const r = `0x` + signedMessage.substring(2).substring(0, 64);
		const s = `0x` + signedMessage.substring(2).substring(64, 128);
		return [v, r, s];
	} catch (err: any) {
		handleError(err);
		throw error(400, `Failed to sign wallet: ${err.message}`);
	}
};

export const validateSign = async (
	message: string,
	signature: string[],
	klaytnEoaAddress: string
): Promise<boolean> => {
	try {
		const url = '/wallet/validate-sign';
		const walletResponse = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message, signature, klaytnEoaAddress })
		});

		return await walletResponse.json();
	} catch (err: any) {
		throw error(400, `Failed to validate signature: ${err.message}`);
	}
};
