export const connectMetamask = async (metamaskProvider: any): Promise<string> => {
	const accounts = await metamaskProvider.request({ method: 'eth_requestAccounts' });
	// You now have an array of accounts!

	if (metamaskProvider.selectedAddress === undefined) {
		console.warn('Account selected is undefined, first account is selected arbitrarily');
		return accounts[0];
	}

	return metamaskProvider.selectedAddress.toLowerCase();
};
