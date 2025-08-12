<script lang="ts">
	import './styles.css';
	let { children } = $props();
</script>

<svelte:head>
	<script>
		document.documentElement.classList.add(
			localStorage.getItem('app:theme') ??
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		);
	</script>
</svelte:head>

<dialog></dialog>

<div class="page-container" style:--client-height={1200}>
	<!-- <header class="top-bar"><Navbar /></header> -->
	<main class="children">{@render children()}</main>
	<!-- <footer class="bottom-bar"><NavigationMenu /></footer> -->
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;

		.children {
			flex: 1;
			overflow-y: auto;
			min-height: 0;
		}
	}
	:global(body) {
		font-family: 'Inter', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: #111827; /* bg-gray-900 */
	}
</style>
