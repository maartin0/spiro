<script lang="ts">
	let {
		callback,
		multiplier,
		...other
	}: {
		callback: (value: number) => unknown;
		disabled: boolean;
		multiplier?: number;
	} = $props();
	let value: number = $state(0);
	multiplier = multiplier || 1;
</script>

<label>
	<input
		type="range"
		required
		min={0}
		max={1}
		step={0.0001}
		bind:value
		oninput={(ev) => callback((ev.target as HTMLInputElement).valueAsNumber * multiplier)}
		{...other}
	/>
	{(value * 100 * multiplier).toPrecision(2)}%/frame
</label>
