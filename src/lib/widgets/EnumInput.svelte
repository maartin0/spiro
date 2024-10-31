<script lang="ts" generics="T extends Record<string, string | number | symbol>">
	let {
		options,
		callback
	}: {
		options: T;
		required: boolean;
		callback: (value: T[keyof T]) => unknown;
	} = $props();
</script>

<select onchange={(ev) => callback((ev.target as HTMLSelectElement).value as T[keyof T])}>
	{#each Object.entries(options) as [key, value]}
		<option {value} selected={(value && key === value) || false}>
			{key}
		</option>
	{/each}
</select>
