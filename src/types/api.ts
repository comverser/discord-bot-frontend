export type ApiError = {
	error?: string;
	code?: number;
	errorDescription?: string;
};

export type WalletData = {
	name: string;
	symbol: string;
	balance: number;
	totalSupply: number;
};
