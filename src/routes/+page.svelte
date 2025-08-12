<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PrayerData } from './+layout';

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
	const dayOfMonth = new Date().getDate();

	// --- TypeScript Interfaces for Type Safety ---

	interface Prayer {
		name: string;
		time: Date;
		timeString: string;
	}

	// --- Constants ---
	const PRAYER_NAMES = ['Fajr', 'Shuruq', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

	// This effect runs whenever prayerData changes
	// $effect(() => {
	// 	if (!prayerData) return;

	// 	const timings = prayerData.timings;
	// 	const now = new Date();

	// 	const schedule = Object.keys(PRAYER_NAMES)
	// 		.map((key) => {
	// 			const timeString = timings[key].split(' ')[0];
	// 			const [hours, minutes] = timeString.split(':');
	// 			const prayerDate = new Date();
	// 			prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
	// 			return { name: key, time: prayerDate, timeString: timeString };
	// 		})
	// 		.sort((a, b) => a.time.getTime() - b.time.getTime());

	// 	prayerSchedule = schedule;

	// 	let nextPrayer = schedule.find((p) => p.time.getTime() > now.getTime());

	// 	// If all prayers for today are done, next is Fajr tomorrow
	// 	if (!nextPrayer) {
	// 		nextPrayer = { ...schedule[0] }; // Fajr
	// 		nextPrayer.time.setDate(nextPrayer.time.getDate() + 1);
	// 	}

	// 	nextPrayerName = PRAYER_NAMES[nextPrayer.name];
	// 	nextPrayerTimeStr = nextPrayer.time.toLocaleTimeString([], {
	// 		hour: '2-digit',
	// 		minute: '2-digit',
	// 		hour12: true
	// 	});
	// 	// Countdown timer
	// 	const intervalId = setInterval(async () => {
	// 		const now = new Date();
	// 		const diff = nextPrayer!.time.getTime() - now.getTime();

	// 		if (diff <= 0) {
	// 			// Time for the next prayer, re-calculate everything
	// 			await invalidateAll();
	// 			return;
	// 		}

	// 		const hours = Math.floor(diff / (1000 * 60 * 60));
	// 		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	// 		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
	// 		countdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	// 	}, 1000);

	// 	// Cleanup function for the effect
	// 	return () => {
	// 		clearInterval(intervalId);
	// 	};
	// });
</script>

<div class="container">
	{#await data.geoData}
		<div>LOADING GEO DATA</div>
	{:then geodata}
		<div>{geodata.city}, {geodata.countryName}</div>
	{/await}
	
	{#await data.positionData}
		<div>LOADING positionData</div>
	{:then positionData}
		<div>{positionData.coords.accuracy}km accuracy</div>
	{/await}
	
	{#await data.prayerData}
		<div>LOADING prayerData</div>
	{:then prayerData}
		<div>{prayerData.data[dayOfMonth].date.readable}</div>
		{#each Object.entries(prayerData.data[dayOfMonth].timings) as [key, value]}
			{#if PRAYER_NAMES.find((value) => value == key) != undefined}
				<div class="row">
					<div>{key}</div>
					<div>{value.split(' ')[0]}</div>
				</div>
			{/if}
		{/each}
	{/await}
</div>

<style>
	.row {
		display: flex;
		justify-content: space-between;
	}

	.container {
		max-width: 30rem;
		margin: auto;
		margin-top: 2rem;
	}
</style>
