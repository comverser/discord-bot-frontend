<script lang="ts">
	import '$root/global.css';
</script>

<svelte:head>
	<title>CAP NFT 홀더 검증</title>
</svelte:head>

<div class="mobile">
	<h2>죄송합니다!</h2>
	<h2>PC로 이용해주세요</h2>
	<p>모바일이나 태블릿은 아직 지원하지 않습니다</p>
	<p>PC로 이용 중이시면 화면 크기를 키워주세요</p>
</div>

<div class="app">
	<slot />
</div>

<style>
	@media (min-width: 992px) {
		.app {
			display: block;
		}
		.mobile {
			display: none;
		}
	}
	@media (max-width: 991.98px) {
		.app {
			display: none;
		}
		.mobile {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 100;

			background-color: var(--color-bg-primary);
			height: 100%;
			width: 100%;

			color: white;

			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-8);

			flex-direction: column;
		}
	}
</style>
