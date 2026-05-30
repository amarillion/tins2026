import { assert } from '@amarillion/helixgraph/lib/assert';
import componentInfo from '../data/components.json';

export const TILESET_WIDTH = 32;

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
	tileIdx: number,
	ports: Record<string, PortInfo[]>,
	render?: string,
};


export function getComponentInfo(type: string): ComponentInfo {
	//TODO: use Zod.
	assert(type in componentInfo.components, `Unknown component id [${type}]`);
	return (componentInfo.components as unknown as Record<string, ComponentInfo>)[type];
}