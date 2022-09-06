export const connectKlip = async (): Promise<string | null> => {
	const { prepare } = await import('klip-sdk');

	// Get request key
	const bappName = 'Mesher';
	const successLink = '';
	const failLink = '';
	const result = await prepare.auth({ bappName, successLink, failLink });

	if (result.err || !result.request_key) return null;

	return result.request_key.toLowerCase();
};

export const getKlipAddress = async (klipRequestKey: string): Promise<string> => {
	let klaytnEoaAddress: string | null = null;
	const url = `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${klipRequestKey}`;

	const delay = (ms: number) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	while (!klaytnEoaAddress) {
		const klipResponse = await fetch(url);
		const data = await klipResponse.json();
		if (data.status === 'completed') {
			klaytnEoaAddress = data.result.klaytn_address as string;
		} else {
			await delay(1000);
		}
	}

	return klaytnEoaAddress;
};
