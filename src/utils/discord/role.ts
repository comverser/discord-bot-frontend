import type { ApiError } from '$root/types/api';

const addRole = async (discordUserId: string, klaytnEoaAddress: string) => {
	// Add role
	const dto = { discordUserId, klaytnEoaAddress };
	const response = await fetch('/role', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(dto)
	});

	return await response.json();
};

type WrappedAddRole = {
	hasAdded: boolean;
	roleError: ApiError;
};

export const wrappedAddRole = async (
	hasValidated: boolean,
	hasBalance: boolean,
	discordUserId: string,
	klaytnEoaAddress: string
): Promise<WrappedAddRole> => {
	let hasAdded = false;
	let roleError: ApiError = { errorDescription: 'Have not been validated or checked' };
	if (!hasValidated || !hasBalance) return { hasAdded, roleError };

	({ roleError } = await addRole(discordUserId, klaytnEoaAddress));
	if (!roleError) hasAdded = true;

	return { hasAdded, roleError };
};
