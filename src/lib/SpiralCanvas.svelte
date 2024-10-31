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

	const EXAMPLES = [
		'{"spirals":{"1":{"ty":0,"props":{"staticSize":0.0948912000000051,"dynamicSize":0.21899400000000954,"offset":0.15,"streakLength":0},"velocities":{"staticSize":0.0000224,"dynamicSize":0.000049500000000000004,"offset":-0.00032,"streakLength":0.000006510000000000001},"colors":["#0080ff","#00ff00","#ffff00"]}},"background":"#000000"}',
		'{"spirals":{"1":{"ty":0,"props":{"staticSize":0.5017809000001074,"dynamicSize":0.5979792999999956,"offset":0.14730999999999675,"streakLength":0},"velocities":{"staticSize":0.0006986000000000001,"dynamicSize":0.0001829,"offset":0.0017500000000000003,"streakLength":0.000006510000000000001},"colors":["#0080ff","#00ff00","#ffff00"]}},"background":"#000000"}'
	];

	const canvasId = createCanvasState();

	let canvas: HTMLCanvasElement | undefined;
	let context: CanvasRenderingContext2D | undefined = $derived(
		canvas?.getContext('2d') || undefined
	);

	let fps: number = $state(-1);
	// There's no point running the animation loop if there's nothing to render, so this is used to keep track of when the animation loop is running
	let running = $state(false);
	// Allows the user to pause animations
	let animationsPaused: boolean = $state(false);

	function trigger() {
		if (!canvas) return;
		canvas.width = window.innerHeight;
		canvas.height = window.innerHeight;
		if (!running) requestAnimationFrame(render);
	}

	function render() {
		running = true;
		let spiralIds: string[];
		if (!(canvas && context && (spiralIds = Object.keys(getCanvasState(canvasId).spirals)))) {
			fps = -1;
			running = false;
			return; // end animation loop if there isn't anything to render
		}

		blank();
		for (const spiralId of spiralIds) {
			const spiral = getSpiral(canvasId, spiralId);
			drawSpiral(spiral, context, canvas.height);
			if (!animationsPaused) tickSpiral(spiral);
		}
		fps = calculateFps(getCanvasState(canvasId));
		requestAnimationFrame(render);
	}

	function blank() {
		if (!context || !canvas) return;
		context.fillStyle = getCanvasState(canvasId).background;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	function importFromText(text: string | null): void {
		if (!text) return;
		try {
			const ref = getCanvasState(canvasId);
			for (const [key, value] of Object.entries(JSON.parse(text))) {
				// @ts-expect-error trusting user input is definitely a great idea
				ref[key] = value;
			}
		} catch (e) {
			alert(`Invalid input:  ${e}`);
			return;
		}
		trigger();
	}

	function exportToText(): string {
		const ref = getCanvasState(canvasId);
		return JSON.stringify({ spirals: ref.spirals, background: ref.background });
	}

	document.addEventListener('keyup', (ev) => {
		// Toggle pause if in fullscreen and space was clicked
		if (!((ev as KeyboardEvent).key === ' ' && document.fullscreenElement)) return;
		animationsPaused = !animationsPaused;
	});
</script>

{#each Object.entries(getCanvasState(canvasId).spirals) as [key, spiral] (key)}
	<SpiralControls {spiral} paused={animationsPaused} />
{/each}

<label>
	Background
	<ColorPicker
		defaultValue={getCanvasState(canvasId).background}
		callback={(v: string) => {
			getCanvasState(canvasId).background = v;
			blank;
		}}
	/>
</label>

<br />

<button
	onclick={() => {
		createSpiral(canvasId);
		trigger();
	}}
>
	New
</button>

<button
	onclick={() => {
		blank();
		resetCanvasState(canvasId);
	}}
	>Reset
</button>

<button
	onclick={async () => {
		if (!canvas) return;
		await canvas.requestFullscreen();
	}}
>
	Fullscreen
</button>

<br />

<button onclick={() => importFromText(prompt('Paste previous state:'))}>Import</button>
<button onclick={() => alert(exportToText())}>Export</button>

<br />

<button onclick={() => navigator.clipboard.readText().then(importFromText).catch()}>
	Import from clipboard
</button>
<button onclick={() => navigator.clipboard.writeText(exportToText())}>Export to clipboard</button>

<br />

{#if animationsPaused}
	<button
		onclick={() => {
			animationsPaused = false;
			trigger();
		}}>Resume animations</button
	>
{:else}
	<button
		onclick={() => {
			animationsPaused = true;
		}}>Pause animations</button
	>
{/if}

<br />

{#each EXAMPLES as example, index}
	<button onclick={() => importFromText(example)}>
		Example {index + 1}
	</button>
{/each}

<br />

{#if running && fps >= 0}
	<span>{fps}fps</span>
{/if}

<br />

<canvas bind:this={canvas} width={window.innerHeight} height={window.innerHeight}></canvas>
