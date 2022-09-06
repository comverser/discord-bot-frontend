<script lang="ts">
	import { onMount } from 'svelte';

	export let codeValue: string;
	export let squareSize: number = 200;

	let qrcode;

	onMount(() => {
		let script = document.createElement('script');
		script.src = 'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js';
		document.head.append(script);

		script.onload = function () {
			qrcode = new QRCode('qrcode', {
				text: codeValue,
				width: squareSize,
				height: squareSize,
				colorDark: '#000000',
				colorLight: '#ffffff',
				correctLevel: QRCode.CorrectLevel.M
			});
		};
	});
</script>

<div id="qrcode" />

<style>
	#qrcode {
		width: 240px;
		height: 240px;
		background-color: white;
		padding: 20px;
		border-radius: 6px;
	}
</style>
