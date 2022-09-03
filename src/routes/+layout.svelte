<script lang="ts">
	import '$root/global.css';
</script>

<svelte:head>
	<title>CAP NFT 홀더 검증</title>
</svelte:head>

<div>
	<h1>죄송합니다! PC로 이용해주세요</h1>
	<p>모바일이나 태블릿은 아직 지원하지 않습니다</p>
	<p>혹시, PC로 이용 중이시면 화면 크기를 키워주세요</p>
</div>

<slot />

<style>
	@media (min-width: 991.99px) {
		div {
			display: none;
		}
	}
	@media (max-width: 991.98px) {
		div {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 100;

			background-color: var(--color-bg-primary);
			height: 100vh;
			width: 100vw;

			color: white;

			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-8);

			flex-direction: column;
		}
	}
</style>
