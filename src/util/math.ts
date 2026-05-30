
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function inverseLerp(a: number, b: number, v: number): number {
	return (v - a) / (b - a);
}
