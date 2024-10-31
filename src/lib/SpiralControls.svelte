<script lang="ts">
	import EnumInput from './widgets/EnumInput.svelte';
	import { SpiralTypeEnum, type Spiral } from './spiral.svelte';
	import VelocityInput from './widgets/VelocityInput.svelte';
	import ColorPicker from './widgets/ColorPicker.svelte';

	let {
		spiral = $bindable(),
		paused
	}: {
		spiral: Spiral;
		paused: boolean;
	} = $props();
</script>

<fieldset>
	<legend>
		<label>
			Type
			<EnumInput
				options={SpiralTypeEnum}
				callback={(v) => {
					spiral.ty = v;
				}}
				required
			/>
		</label>
	</legend>

	<label>
		Static circle size
		<input
			type="range"
			min={0}
			max={1}
			step={0.001}
			value={spiral.props.staticSize}
			oninput={(ev) => {
				spiral.props.staticSize = (ev.target as HTMLInputElement).valueAsNumber;
			}}
			required
		/>
		{Math.round(spiral.props.staticSize * 100)}%
		<VelocityInput
			disabled={paused}
			multiplier={0.001}
			initialValue={spiral.velocities.staticSize}
			callback={(v) => {
				spiral.velocities.staticSize = v;
			}}
		/>
	</label><br />

	<label>
		Dynamic circle size
		<input
			type="range"
			min={0}
			max={1}
			step={0.001}
			value={spiral.props.dynamicSize}
			oninput={(ev) => {
				spiral.props.dynamicSize = (ev.target as HTMLInputElement).valueAsNumber;
			}}
			required
		/>
		{Math.round(spiral.props.dynamicSize * 100)}%
		<VelocityInput
			disabled={paused}
			multiplier={0.001}
			initialValue={spiral.velocities.dynamicSize}
			callback={(v) => {
				spiral.velocities.dynamicSize = v;
			}}
		/>
	</label><br />

	<label>
		Size
		<input
			type="range"
			min={0}
			max={1}
			step={0.01}
			value={spiral.props.offset}
			oninput={(ev) => {
				spiral.props.offset = (ev.target as HTMLInputElement).valueAsNumber;
			}}
			required
		/>
		{Math.round(spiral.props.offset * 100)}%
		<VelocityInput
			disabled={paused}
			multiplier={0.1}
			initialValue={spiral.velocities.offset}
			callback={(v) => {
				spiral.velocities.offset = v;
			}}
		/>
	</label><br />

	<label>
		Streak length
		<input
			type="range"
			min={0}
			max={1}
			step={0.001}
			value={spiral.props.streakLength}
			oninput={(ev) => {
				spiral.props.streakLength = (ev.target as HTMLInputElement).valueAsNumber;
			}}
			required
		/>
		{Math.round(spiral.props.streakLength * 100)}%
		<VelocityInput
			multiplier={0.0001}
			initialValue={spiral.velocities.streakLength}
			callback={(v) => {
				spiral.velocities.streakLength = v;
			}}
			disabled={paused}
		/>
	</label>

	<label>
		Colours
		<div class="row">
			{#each spiral.colors as color, index}
				<ColorPicker
					defaultValue={color}
					callback={(v) => {
						spiral.colors[index] = v;
					}}
				/>
				<button
					onclick={() => {
						spiral.colors.splice(index, 1);
					}}>X</button
				>
			{/each}
			<button
				onclick={() => {
					spiral.colors.push('#000000');
				}}>+</button
			>
		</div>
	</label>
</fieldset>

<style>
	label {
		display: flex;
		align-items: center;
	}
	fieldset {
		width: max-content;
	}
	div.row {
		display: flex;
	}
</style>
