<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PrayerData, PrayerTimings } from './+layout';

	// Svelte 5 Runes for reactive state
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let locationName = $state('');
	let prayerData = $state<PrayerData | null>(null);
	let countdown = $state('');
	let nextPrayerName = $state('');
	let nextPrayerTimeStr = $state('');
	let prayerSchedule = $state<Prayer[]>([]);

	let { data } = $props();
	const dayOfMonth = new Date().getDate() - 1;
	const nextPrayer = $derived.by(() => {
		return data.prayerData.then((value) => getNextPrayer(value.data[dayOfMonth].timings));
	});

	// --- TypeScript Interfaces for Type Safety ---

	interface Prayer {
		name: string;
		time: Date;
		timeString: string;
	}

	// --- Constants ---
	const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

	// This effect runs whenever prayerData changes
	// $effect(() => {
	// 	if (!prayerData) return;

	function getNextPrayer(timings: PrayerTimings) {
		const now = new Date();
		const schedule = PRAYER_NAMES.map((key) => {
			const timeString = timings[key].split(' ')[0];
			const [hours, minutes] = timeString.split(':');
			const prayerDate = new Date();
			prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
			return { name: key, time: prayerDate, timeString: timeString };
		}).sort((a, b) => a.time.getTime() - b.time.getTime());
		console.log(schedule);
		let nextPrayer = schedule.find((p) => p.time.getTime() > now.getTime());

		if (!nextPrayer) {
			nextPrayer = { ...schedule[0] }; // Fajr
			nextPrayer.time.setDate(nextPrayer.time.getDate() + 1);
		}

		// nextPrayerName = nextPrayer.name;
		return {
			name: nextPrayer.name,
			date: nextPrayer.time.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			})
		};
	}

	// Countdown timer
	// const intervalId = setInterval(async () => {
	// 	const now = new Date();
	// 	const diff = nextPrayer!.time.getTime() - now.getTime();

	// 	if (diff <= 0) {
	// 		// Time for the next prayer, re-calculate everything
	// 		await invalidateAll();
	// 		return;
	// 	}

	// 	const hours = Math.floor(diff / (1000 * 60 * 60));
	// 	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	// 	const seconds = Math.floor((diff % (1000 * 60)) / 1000);
	// 	countdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	// }, 1000);
</script>

{#snippet next_prayer_snippet(timings: PrayerTimings)}
	<div class="next-prayer">
		<div>
			{getNextPrayer(timings).name}
		</div>
		<div>
			{getNextPrayer(timings).date}
		</div>
	</div>
{/snippet}
<div class="container">
	{#await data.geoData}
		<div>Loading GEO DATA</div>
	{:then geodata}
		<div class="row">
			<div>{geodata.city}, {geodata.countryName}</div>
			<div>{new Date().toDateString()}</div>
		</div>
	{/await}

	{#await data.positionData}
		<div>Loading positionData</div>
	{:then positionData}
		<div>{positionData.coords.accuracy.toFixed(0)}m accuracy</div>
		<!-- <div>lat: {positionData.coords.latitude}</div>
		<div>long: {positionData.coords.longitude}</div> -->
	{/await}

	{#await data.prayerData}
		<div>Loading prayerData</div>
	{:then prayerData}
		<!-- {@render next_prayer_snippet(prayerData.data[dayOfMonth].timings)} -->
		<!-- <div>{prayerData.data[dayOfMonth].date.readable}</div> -->
		<div class="prayer-container">
			{#each Object.entries(prayerData.data[dayOfMonth].timings) as [key, value]}
				{#if PRAYER_NAMES.find((value) => value == key) != undefined}
					<div class="row card" class:next={getNextPrayer(prayerData.data[dayOfMonth].timings).name == key}>
						<div>{key}</div>
						<div>{value.split(' ')[0]}</div>
					</div>
				{/if}
			{/each}
		</div>
	{/await}
</div>

<style>
	.next {
		background-color: #2a5ac2;
	}
	.card {
		padding: 0.2rem 0.5rem;
		border-radius: 5px;
	}
	.prayer-container {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin-top: 3rem;
	}
	.row {
		display: flex;
		justify-content: space-between;
	}

	.container {
		max-width: 30rem;
		margin: auto;
		padding: 1rem;
	}

	.next-prayer {
		margin: auto;
		width: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
