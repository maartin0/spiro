<script lang="ts">
	import {
		calculateFps,
		createCanvasState,
		createSpiral,
		drawSpiral,
		getCanvasState,
		getSpiral,
		resetCanvasState,
		tickSpiral
	} from './spiral.svelte';
	import SpiralControls from './SpiralControls.svelte';
	import ColorPicker from './widgets/ColorPicker.svelte';

	const canvasId = createCanvasState();

	// svelte-ignore non_reactive_update
	let canvas: HTMLCanvasElement | undefined;
	let context: CanvasRenderingContext2D | undefined = $derived(
		canvas?.getContext('2d') || undefined
	);

	const trigger = () => requestAnimationFrame(render);

	let dimensions: { width: number; height: number } | undefined = undefined;
	let fps: number = $state(-1);
	let paused: boolean = $state(false);

	let running = false;

	function render() {
		running = true;
		if (paused) return;
		if (!(canvas && context)) {
			trigger();
			return;
		}

		if (!dimensions) dimensions = { width: canvas.width, height: canvas.height };

		const spiralIds = Object.keys(getCanvasState(canvasId).spirals);
		if (!spiralIds) {
			fps = -1;
			running = false;
			return; // end animation loop if there isn't anything to render
		}

		blank();
		for (const spiralId of spiralIds) {
			const spiral = getSpiral(canvasId, spiralId);
			drawSpiral(spiral, context, dimensions);
			tickSpiral(spiral);
		}
		fps = calculateFps(getCanvasState(canvasId));
		trigger();
	}

	function blank() {
		if (!context || !canvas) return;
		context.fillStyle = getCanvasState(canvasId).background;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	function reset() {
		blank();
		resetCanvasState(canvasId);
	}

	function importFromText(text: string | null): void {
		if (!text) return;
		const ref = getCanvasState(canvasId);
		for (const [key, value] of Object.entries(JSON.parse(text))) {
			// @ts-expect-error trusting user input is definitely a great idea
			ref[key] = value;
		}
		if (!running) trigger();
	}

	function exportToText(): string {
		const ref = getCanvasState(canvasId);
		return JSON.stringify({ spirals: ref.spirals, background: ref.background });
	}
</script>

{#each Object.entries(getCanvasState(canvasId).spirals) as [key, spiral] (key)}
	<SpiralControls {spiral} disabled={paused} />
{/each}

<label>
	Background
	<ColorPicker
		defaultValue={getCanvasState(canvasId).background}
		callback={(v: string) => {
			getCanvasState(canvasId).background = v;
			blank;
		}}
		disabled={paused}
	/>
</label><br />

<button
	disabled={paused}
	onclick={() => {
		createSpiral(canvasId);
		if (!running) trigger();
	}}>New</button
>

<button
	disabled={paused}
	onclick={() => {
		if (canvas && context) reset();
	}}
	>Reset
</button>

<button
	onclick={async () => {
		if (!canvas) return;
		await canvas.requestFullscreen();
	}}>Fullscreen</button
>

<br />

<button disabled={paused} onclick={() => importFromText(prompt('Paste previous state:'))}>
	Import
</button>

<button onclick={() => alert(exportToText())}>Export</button>

<br />

<button onclick={() => navigator.clipboard.readText().then(importFromText).catch()}>
	Import from clipboard
</button>
<button onclick={() => navigator.clipboard.writeText(exportToText())}>Export to clipboard</button>

<br />
{#if paused}
	<button
		onclick={() => {
			paused = false;
			getCanvasState(canvasId).lastFramesMs = [];
			trigger();
		}}>Resume</button
	>
{:else}
	<button
		onclick={() => {
			paused = true;
		}}>Pause</button
	>
{/if}
<br />

{#if !paused && fps >= 0}
	<span>{fps}fps</span>
{/if}

<br />
<canvas bind:this={canvas} width={window.innerHeight} height={window.innerHeight}></canvas>
