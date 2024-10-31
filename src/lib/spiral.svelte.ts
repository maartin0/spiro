const FPS_BUFFER_SIZE = 80;
const RESOLUTION = Math.PI / 180;

export type EnumKeys<T extends Record<string | number | symbol, unknown>> = keyof T;
export type EnumValues<T extends Record<string | number | symbol, unknown>> = T[keyof T];

let id = 0;
const genId = (): string => `${id++}`;

const canvases: Record<string, SpiralCanvasState> = $state({});
export const getCanvasState = (canvasId: string): SpiralCanvasState => canvases[canvasId];
export const getSpiral = (canvasId: string, spiralId: string): Spiral =>
	canvases[canvasId].spirals[spiralId];
export const createCanvasState = (): string => {
	const id = genId();
	canvases[id] = {
		lastFramesMs: [],
		spirals: {},
		background: '#ffffff'
	};
	return id;
};
export const createSpiral = (canvasId: string): string => {
	const canvas = canvases[canvasId];
	const id = genId();
	canvas.spirals[id] = DEFAULT_SPIRAL;
	return id;
};
export const resetCanvasState = (canvasId: string): void => {
	canvases[canvasId].spirals = {};
};

export interface SpiralCanvasState {
	/**
	 * Spirals that are currently being rendered
	 */
	spirals: Record<string, Spiral>;
	/**
	 * Timestamps when the last 5 frames was rendered
	 */
	lastFramesMs: number[];
	/**
	 * Canvas background color
	 */
	background: string;
}

export const SpiralTypeEnum = {
	/**
	 * Inner circle moves
	 */
	Hypotrochoid: 0,
	/**
	 * Outer circle moves
	 */
	Epitrochoid: 1
};

export interface SpiralProperties {
	/**
	 * Size of the circle that doesn't move
	 */
	staticSize: number;
	/**
	 * Size of the circle that moves
	 */
	dynamicSize: number;
	/**
	 * Offset of the dynamic (moving) circle from the larger circle
	 */
	offset: number;
	/**
	 * Streak length as a multiple of Pi
	 */
	streakLength: number;
}

export interface Spiral {
	/**
	 * Type of the spirograph
	 */
	ty: (typeof SpiralTypeEnum)[keyof typeof SpiralTypeEnum];
	/**
	 * Current spiral property values
	 */
	props: SpiralProperties;
	/**
	 * Offset for each property / frame
	 */
	velocities: SpiralProperties;
	/**
	 * Single color or multiple colors to use as a gradient
	 */
	colors: string[];
}

export function calculateFps(state: SpiralCanvasState): number {
	// Update rolling buffer
	while (state.lastFramesMs.length > FPS_BUFFER_SIZE) state.lastFramesMs.pop();
	state.lastFramesMs = [Date.now(), ...state.lastFramesMs];

	// Convert to an array of deltas
	const deltas: number[] = (
		state.lastFramesMs
			.map((value, index, array): number | undefined => {
				if (index === array.length - 1) return undefined;
				return array[index + 1] - value;
			})
			.filter((v) => v) as number[]
	).sort();

	// Get modal value
	return Math.abs(
		Math.round(
			deltas.length === 0 ? -1
			: deltas.length % 2 === 0 ? (deltas[deltas.length / 2 - 1] + deltas[deltas.length / 2]) / 2
			: deltas[Math.floor(deltas.length / 2)]
		)
	);
}

export const DEFAULT_SPIRAL: Spiral = {
	ty: SpiralTypeEnum.Hypotrochoid,
	props: {
		staticSize: 0.5,
		dynamicSize: 0.8,
		offset: 0.2,
		streakLength: 0.1
	},
	velocities: {
		staticSize: 0,
		dynamicSize: 0,
		offset: 0,
		streakLength: 0
	},
	colors: ['#000000']
};

/**
 * Uses the parametric equations for a Hypotrochoid and Epitrochoid respectively
 * @param spiral Spiral object
 * @param t Current time in radians
 * @returns [x, y] coordinates
 */
export function computePosition(
	{ props: { dynamicSize: r, staticSize: R, offset: O }, ty }: Spiral,
	t: number
): [number, number] {
	return ty === SpiralTypeEnum.Hypotrochoid ?
			[
				(R - r) * Math.cos(t) + O * Math.cos(((R - r) / r) * t),
				(R - r) * Math.sin(t) - O * Math.sin(((R - r) / r) * t)
			]
		:	[
				(R + r) * Math.cos(t) - O * Math.cos(((R + r) / r) * t),
				(R + r) * Math.sin(t) - O * Math.sin(((R + r) / r) * t)
			];
}

export function tickSpiral(spiral: Spiral): void {
	for (const key of Object.keys(spiral.props) as (keyof SpiralProperties)[]) {
		spiral.props[key] += spiral.velocities[key];
		if (spiral.props[key] > 1) spiral.velocities[key] = -Math.abs(spiral.velocities[key]);
		else if (spiral.props[key] < 0) spiral.velocities[key] = Math.abs(spiral.velocities[key]);
	}
}

function scale([x, y]: [number, number], mul: number): [number, number] {
	return [Math.round((x / 4 + 0.5) * mul), Math.round((y / 4 + 0.5) * mul)];
}

function getComponents(color: string): [number, number, number] {
	return [
		Number.parseInt(color.slice(1, 3), 16),
		Number.parseInt(color.slice(3, 5), 16),
		Number.parseInt(color.slice(5, 7), 16)
	];
}

function toHex(component: number): string {
	return Math.round(component).toString(16).padStart(2, '0').slice(-2);
}

function encodeColor(r: number, g: number, b: number): string {
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColor(ratio: number, start: string, end: string): string {
	const [rs, gs, bs] = getComponents(start);
	const [re, ge, be] = getComponents(end);
	return encodeColor(ratio * (re - rs) + rs, ratio * (ge - gs) + gs, ratio * (be - bs) + bs);
}

function interpolateColorOptions(ratio: number, options: string[]): string {
	const index = ratio * (options.length - 1);
	const start = options[Math.floor(index)];
	const end = options[Math.ceil(index)];
	if (!start || !end) return options[0];
	return interpolateColor(index % 1, start, end);
}

export function drawSpiral(
	spiral: Spiral,
	context: CanvasRenderingContext2D,
	multiplier: number
): void {
	const end = spiral.props.streakLength * Math.PI * 2000;
	let startPixel = scale(computePosition(spiral, 0), multiplier);
	for (let t = 0; t <= end; t += RESOLUTION) {
		const pixel = scale(computePosition(spiral, t), multiplier);
		context.beginPath();
		context.moveTo(startPixel[0], startPixel[1]);
		context.lineTo(pixel[0], pixel[1]);
		context.strokeStyle = interpolateColorOptions(t / end, spiral.colors);
		startPixel = pixel;
		context.stroke();
	}
}
