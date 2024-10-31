<script lang="ts">
	export const {
		defaultValue,
		callback
	}: {
		defaultValue: string;
		callback: (value: string) => unknown;
	} = $props();
</script>

<input
	type="color"
	value={defaultValue}
	onchange={(ev) => callback((ev.target as HTMLInputElement).value)}
/>
