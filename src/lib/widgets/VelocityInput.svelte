<script lang="ts">
	let {
		callback,
		multiplier,
		initialValue,
		...other
	}: {
		initialValue?: number;
		callback: (value: number) => unknown;
		disabled: boolean;
		multiplier?: number;
	} = $props();
	let value: number = $state(initialValue || 0);
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
