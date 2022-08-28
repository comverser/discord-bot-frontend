<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import type { ApiError, WalletData } from '$root/types/api';
	import { connectWallet, getWalletInfo, signWallet, validateSign } from '$root/api/wallet';
	import { assignDiscordRole } from '$root/api/discord';

	let hasBalance = false;
	let hasValidated = false;
	let hasRefused = false;
	let hasSigned = false;
	let hasAssigned = false;

	let discordError: ApiError | null = null;
	let klaytnError: ApiError | null = null;

	let kaikasProvider: any = null;
	let klaytnWalletAddr: string | null = null;

	const KLAYTN_CAP_NFT_ENTER = import.meta.env.VITE_KLAYTN_CAP_NFT_ENTER;
	const KLAYTN_CAP_NFT_ENTER_LP = import.meta.env.VITE_KLAYTN_CAP_NFT_ENTER_LP;

	export let data: any; // Discord user data

	if (data.error) {
		console.error(data.errorDescription);
		discordError = data;
	}
	const discordUserId = data.id;

	const resetStatusParam = () => {
		hasBalance = false;
		hasValidated = false;
		hasRefused = false;
		hasSigned = false;
		hasAssigned = false;

		klaytnError = null;
	};

	const handler = async () => {
		resetStatusParam();

		if (kaikasProvider === null) throw new Error('Kaikas provider is empty');

		try {
			// Connect to wallet
			klaytnWalletAddr = await connectWallet(kaikasProvider);

			// Get wallet information
			const walletDataEnter: WalletData | undefined = await getWalletInfo(
				KLAYTN_CAP_NFT_ENTER,
				klaytnWalletAddr
			);
			const walletDataEnterLp: WalletData | undefined = await getWalletInfo(
				KLAYTN_CAP_NFT_ENTER_LP,
				klaytnWalletAddr
			);

			// Check balance
			if (walletDataEnter!.balance > 0 || walletDataEnterLp!.balance > 0) hasBalance = true;
			console.debug('ENTER:', walletDataEnter);
			console.debug('ENTER LP:', walletDataEnterLp);
		} catch (err: any) {
			klaytnError = {
				error: err.message,
				errorDescription:
					'죄송합니다!<br />현재 사용자가 많아 이용이 불가합니다<br />다음에 다시 시도해주세요',
				code: err.status
			};

			throw new Error(err.message);
		}

		if (!hasBalance) return;

		while (!hasSigned) {
			try {
				const message = 'Mesher CAP NFT holder';
				const signature = await signWallet(klaytnWalletAddr, message);
				hasValidated = await validateSign(message, signature, klaytnWalletAddr);
				if (hasValidated) hasSigned = true;
			} catch (err) {
				console.log(err.message);
				if (err.message.includes('Kaikas Message Signature: User denied message signature.')) {
					hasRefused = true;
					continue;
				}
				throw new Error(err.message);
			}
		}

		// Check again
		if (!hasSigned || !hasValidated || !hasBalance) return;

		// Asign new role of Discord
		try {
			hasAssigned = await assignDiscordRole(discordUserId);
		} catch (err) {
			throw new Error(err.message);
		}
	};

	onMount(async () => {
		if (discordError) throw new Error('Error occurred');

		kaikasProvider = (window as any).klaytn;

		await handler();
	});
</script>

{#if discordError}
	<div class="error">
		<h1>{discordError.error}</h1>
		<p>에러가 발생하였습니다</p>
		<p>처음부터 다시 시도해주세요</p>
	</div>
{/if}

<main>
	{#if klaytnWalletAddr === null}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>지갑을 먼저 연결해주세요</p>
			<button on:click={handler} class="btn-highlight">지갑 연결하기</button>
		</div>
	{:else if !hasBalance}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>CAP NFT 홀더 검증에 실패하였습니다</p>
			{#if klaytnError}
				<p>{@html klaytnError.errorDescription}</p>
			{:else}
				<p>알맞은 지갑을 연결하셨나요?</p>
				<p>처음부터 다시 시도해주세요</p>
			{/if}
		</div>
	{:else if !hasValidated}
		{#if !hasRefused}
			<div
				class="container"
				in:fly={{ y: 150, duration: 200, delay: 200 }}
				out:fly={{ y: -150, duration: 200 }}
			>
				<p>홀더 검증을 위한 서명을 해주세요</p>
			</div>
		{:else}
			<div
				class="container"
				in:fly={{ y: 150, duration: 200, delay: 200 }}
				out:fly={{ y: -150, duration: 200 }}
			>
				<p>홀더 검증을 위해 서명이 꼭 필요합니다</p>
			</div>
		{/if}
	{:else if !hasAssigned}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>홀더 검증을 완료하였습니다</p>
			<p>메셔 디스코드 서버 권한 향상 중...</p>
		</div>
	{:else}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>모든 과정이 끝났습니다</p>
			<p>감사합니다</p>
		</div>
	{/if}
</main>

<style>
	.error {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;

		background-color: var(--color-bg-primary);
		height: 100vh;
		width: 100vw;

		color: white;
		margin: var(--spacing-16);

		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
	}

	main {
		height: 100vh;

		display: flex;
		justify-content: center;
		align-content: center;
		align-items: center;

		flex-direction: column;
	}

	.container {
		width: 540px;

		padding: var(--spacing-32);
		border-radius: var(--radius-base);

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: var(--spacing-16);

		background-color: var(--color-bg-secondary);

		text-align: center;
	}
</style>
