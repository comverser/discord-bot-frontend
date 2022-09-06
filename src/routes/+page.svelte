<script lang="ts">
	import { browser } from '$app/env';
	import { fly } from 'svelte/transition';

	import type { ApiError } from '$root/types/api';
	import { connectKaikas, validateKaikas } from '$root/utils/wallet/kaikas';
	import { connectKlip, getKlipAddress } from '$root/utils/wallet/klip';
	import { checkBalance } from '$root/utils/wallet/general';
	import { wrappedAddRole } from '$root/utils/discord/role';

	import QrCode from '$root/components/QrCode.svelte';

	let klipRequestKey: string | null = null;
	let isKlip: boolean = false;
	let hasCheckedBalance = false;
	let hasBalance = false;
	let hasValidated = false;
	let hasRefused = false;
	let hasAdded = false;

	let discordOauth2Error: ApiError | null = null;
	let kasPublicNodeError: ApiError | null = null;
	let roleError: ApiError | null = null;

	let klaytnEoaAddress: string | null = null;

	export let data: any; // Discord user data

	if (data.error) {
		console.error(data.errorDescription);
		discordOauth2Error = data;
	}
	const discordUserId: string = data.id;

	const handleKaikas = async () => {
		// Check browser and provider
		if (!browser) throw new Error('Browser is not mounted yet');
		const kaikasProvider = (window as any).klaytn;
		if (kaikasProvider === null) throw new Error('Kaikas provider is empty');

		// Connect to wallet
		klaytnEoaAddress = await connectKaikas(kaikasProvider);

		// Check balance
		({ hasBalance, kasPublicNodeError } = await checkBalance(klaytnEoaAddress));
		hasCheckedBalance = true;
		if (!hasBalance) return;

		// Validate Kaikas wallet
		while (!hasValidated) {
			try {
				hasValidated = await validateKaikas(klaytnEoaAddress);
			} catch (err) {
				if (err.message.includes('Kaikas Message Signature: User denied message signature.')) {
					hasRefused = true;
					continue;
				}
			}
		}

		// Add role (must be final step)
		({ hasAdded, roleError } = await wrappedAddRole(
			hasValidated,
			hasBalance,
			discordUserId,
			klaytnEoaAddress
		));
	};

	const handleKlip = async () => {
		// Check browser and provider
		if (!browser) throw new Error('Browser is not mounted yet');

		isKlip = true;

		// Connect to wallet
		klipRequestKey = await connectKlip();
		if (!klipRequestKey) throw new Error('Klip-SDK is not working propery');
		klaytnEoaAddress = await getKlipAddress(klipRequestKey);

		// Check balance
		({ hasBalance, kasPublicNodeError } = await checkBalance(klaytnEoaAddress));
		hasCheckedBalance = true;
		if (!hasBalance) return;

		// Skip validation
		hasValidated = true;

		// Add role (must be final step)
		({ hasAdded, roleError } = await wrappedAddRole(
			hasValidated,
			hasBalance,
			discordUserId,
			klaytnEoaAddress
		));
	};
</script>

{#if discordOauth2Error}
	<div class="error">
		<h1>{discordOauth2Error.error}</h1>
		<p>에러가 발생하였습니다</p>
		<p>혹시 새로고침을 하셨나요? 보안을 위해 새로고침을 허용하지 않습니다</p>
		<p>처음부터 다시 시도해주세요</p>
	</div>
{/if}

<main>
	{#if !klaytnEoaAddress && !isKlip}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<h3>지갑을 연결해주세요</h3>
			<div class="select">
				<button on:click={handleKaikas} class="btn-highlight">카이카스 지갑 연결하기</button>
				<p>또는</p>
				<button on:click={handleKlip} class="btn-highlight">클립 지갑 연결하기</button>
			</div>
		</div>
	{:else if !klaytnEoaAddress && isKlip}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<h3>클립 연결하기</h3>
			{#if klipRequestKey}
				<QrCode codeValue={`https://klipwallet.com/?target=/a2a?request_key=${klipRequestKey}`} />
			{/if}
			<p>5분 내 QR 코드를 스캔해주세요</p>
		</div>
	{:else if !hasCheckedBalance}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>CAP NFT 보유 확인 중</p>
		</div>
	{:else if !hasBalance}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>CAP NFT 홀더 검증에 실패하였습니다</p>
			{#if kasPublicNodeError}
				<p>{@html kasPublicNodeError.errorDescription}</p>
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
	{:else if !hasAdded}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			{#if !roleError}
				<p>홀더 검증을 완료하였습니다</p>
				<p>메셔 디스코드 서버 권한 향상 중...</p>
				<p>아직 창을 닫지 말아주세요 (3분 이하 소요)</p>
			{:else}
				<p>{roleError.errorDescription}</p>
			{/if}
		</div>
	{:else if hasAdded}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>모든 과정이 끝났습니다</p>
			<p>감사합니다</p>
		</div>
	{:else}
		<div
			class="container"
			in:fly={{ y: 150, duration: 200, delay: 200 }}
			out:fly={{ y: -150, duration: 200 }}
		>
			<p>에러가 발생하였습니다</p>
			<p>관리자에게 문의하여 주세요</p>
			<p>관리자 연락처 : comverser@mesher.io</p>
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

	.select {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
	}
</style>
