import { assert } from '@amarillion/helixgraph/lib/assert';
import componentInfo from '../data/components.json';

export type PortInfo = {
	dx: number,
	dy: number,
	type: "out" | "in",
	calc?: string,
	global?: boolean,
};

export type ComponentInfo = {
	name: string,
	size: [number, number],
	tilePos: [number, number],
	ports: Record<string, PortInfo[]>,
	render?: string,
};


export function getComponentInfo(type: string): ComponentInfo {
	//TODO: use Zod.
	assert(type in componentInfo.components);
	return (componentInfo.components as unknown as Record<string, ComponentInfo>)[type];
}