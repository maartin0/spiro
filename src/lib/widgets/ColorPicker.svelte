<script lang="ts">
	export const {
		defaultValue,
		callback,
		disabled
	}: {
		disabled: boolean;
		defaultValue: string;
		callback: (value: string) => unknown;
	} = $props();
</script>

<input
	type="color"
	value={defaultValue}
	onchange={(ev) => callback((ev.target as HTMLInputElement).value)}
	{disabled}
/>
