import { assert } from "@amarillion/helixgraph/lib/assert.js";
import { TemplateGrid } from "@amarillion/helixgraph/lib/BaseGrid.js";
import { RecursiveBackTrackerIter } from "@amarillion/helixgraph";
import Phaser from "phaser";

const MSEC_PER_ITERATION = 20;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;

const NORTH = 1;
const EAST = 2;
const SOUTH = 4;
const WEST = 8;

type Dir = typeof NORTH | typeof SOUTH | typeof EAST | typeof WEST;
type Edge = { dir : Dir, tunnel: boolean };

const HORIZONTAL = EAST | WEST;
const VERTICAL = NORTH | SOUTH;

// for being able to find opposite directions
const REVERSE: Record<Dir, Dir> = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST,
};

// Corresponding tile-idx for every combination of the 4 cardinal directions.
const TILE_IDX_BY_TERRAIN = {
	[EAST]: 0,
	[EAST | WEST]: 1,
	[WEST]: 2,
	[0]: 3,
	[SOUTH | EAST]: 4,
	[SOUTH | EAST | WEST]: 5,
	[SOUTH | WEST]: 6,
	[SOUTH]: 7,
	[NORTH | SOUTH | EAST]: 8,
	[NORTH | SOUTH | EAST | WEST]: 9,
	[NORTH | SOUTH | WEST]: 10,
	[NORTH | SOUTH]: 11,
	[NORTH | EAST]: 12,
	[NORTH | EAST | WEST]: 13,
	[NORTH | WEST]: 14,
	[NORTH]: 15,
};

class Node {

	x: number;
	y: number;
	grid: TemplateGrid<Node>;
	onChange: (n: Node) => void;
	links: Record<string, Node> = {};
	tunnel: Node | null = null;
	color: unknown | null = null;

	constructor(x: number, y: number, grid: TemplateGrid<Node>, onChange: (n: Node) => void) {
		this.x = x;
		this.y = y;
		this.grid = grid;
		this.onChange = onChange;
	}

	getByDir(dir: Dir) {
		switch (dir) {
			case NORTH: return this.grid.get(this.x, this.y - 1);
			case EAST: return this.grid.get(this.x + 1, this.y);
			case SOUTH: return this.grid.get(this.x, this.y + 1);
			case WEST: return this.grid.get(this.x - 1, this.y);
		}
	}

	createTunnel() {
		assert(!this.tunnel, "Error, created tunnel twice");
		this.tunnel = new Node(this.x, this.y, this.grid, () => { this.onChange(this.tunnel!); });
		this.tunnel.tunnel = this; // A tunnel is a pair of nodes that refer to each other
		return this.tunnel;
	}

	/** iterates over adjacent pristine nodes, but can also offer up potential new tunnels */
	*getOpenLinks() : Iterable<[Edge, Node]> {
		if (this.tunnel) return;

		for (const dir of [ NORTH, EAST, SOUTH, WEST ] as Dir[]) {
			const adjacent = this.getByDir(dir);
			if (adjacent) {
				// only pristine nodes
				if (Object.keys(adjacent.links).length === 0) {
					yield [ { dir, tunnel: false }, adjacent ];
				}
				
				// see if we can create potentially a new tunnel
				const otherSide = adjacent.getByDir(dir);
				if (otherSide) {
					const orthogonal = adjacent.isOrthogonal(dir);
					const alreadyHasTunnel = Boolean(adjacent.tunnel);
					const otherSidePristine = Object.keys(otherSide.links).length === 0;
					if (otherSidePristine && orthogonal && !alreadyHasTunnel) {
						yield [ { dir, tunnel: true }, otherSide ];
					}
				}
			}
		}
	}

	isOrthogonal(dir: Dir) {
		const dirSet = this.dirSet();
		return (dirSet === HORIZONTAL || dirSet === VERTICAL) && ((dir & dirSet) === 0);
	}

	/**
	 * @param {*} other cell to link to
	 * @param {*} dir one of NORTH, EAST, SOUTH, WEST
	 * @param {*} reverse optional - if defined, also create link in this reverse direction
	 */
	link(other: Node, dir: Dir, reverse?: Dir) {
		assert (!(dir in this.links), "Trying to create link twice");
		this.links[dir] = other;
		if (reverse) {
			// call recursively just once!
			other.link(this, reverse);
		}
		this.onChange(this);
	}

	makeEdge(other: Node, edge: { tunnel: unknown, dir: Dir }, color: string) {
		this.color = color;
		other.color = color;
		if (edge.tunnel) {
			const adjacent = this.getByDir(edge.dir);
			const tunnel = adjacent.createTunnel();
			tunnel.color = color;
			this.link(tunnel, edge.dir, REVERSE[edge.dir]);
			tunnel.link(other, edge.dir, REVERSE[edge.dir]);
		}
		else {
			this.link(other, edge.dir, REVERSE[edge.dir]);
		}
	}

	dirSet() {
		return Object.keys(this.links).reduce((prev, curr) => prev + Number(curr), 0);
	}
}

export class Maze extends Phaser.Scene {

	map: Phaser.Tilemaps.Tilemap | null = null;
	layer0: Phaser.Tilemaps.TilemapLayer | null = null;
	layer1: Phaser.Tilemaps.TilemapLayer | null = null;
	prevTime: number = 0;
	running: boolean = false;
	iter: RecursiveBackTrackerIter<Node, Edge> | null = null;
	iter2: RecursiveBackTrackerIter<Node, Edge> | null = null;

	constructor() {
		super({ key: "Maze" });
	}

	preload() {
		this.load.image("pipes", "pipes.png");
	}

	reset() {
		if (this.map) this.map.destroy();
		
		const mw = Math.max(3, Math.floor(this.cameras.main.width / TILE_WIDTH));
		const mh = Math.max(3, Math.floor(this.cameras.main.height / TILE_HEIGHT));
		
		this.map = this.make.tilemap({ tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT, width: mw, height: mh });
		const tiles = this.map.addTilesetImage("pipes");
		this.layer0 = this.map.createBlankLayer("layer0", tiles!);
		this.layer1 = this.map.createBlankLayer("layer1", tiles!);

		const grid = new TemplateGrid(mw, mh, (x: number, y: number, self) => new Node(x, y, self as TemplateGrid<Node>, (n: Node) => this.onChange(n)));
		
		const cx = Math.floor(mw / 2);
		const cy = Math.floor(mh / 2);
		this.iter = new RecursiveBackTrackerIter(
			grid.get(cx + 1, cy + 1), n => n.getOpenLinks(), (src, edge, dest) => src.makeEdge(dest, edge, "grey"),
		);

		this.iter2 = new RecursiveBackTrackerIter(
			grid.get(cx - 1, cy - 1), n => n.getOpenLinks(), (src, edge, dest) => src.makeEdge(dest, edge, "red"),
		);
		this.running = true;
	}

	create() {
		// TODO: game constants...
		this.cameras.main.setBackgroundColor('#ffff00');
		this.cameras.main.setViewport(0, 136, 768, 768);

		this.reset();
		// this.scale.on("resize", (newSize: { width: number, height: number }) => {
		// 	if (
		// 		Math.floor(newSize.width / TILE_WIDTH) !== this.map?.width ||
		// 		Math.floor(newSize.height / TILE_HEIGHT) !== this.map?.height
		// 	) {
		// 		this.reset();
		// 	}
		// });
	}

	onChange(node: Node) {
		function drawNodeOnLayer(layer: Phaser.Tilemaps.TilemapLayer, aNode: Node) {
			const dirSet = aNode.dirSet();
			// to toggle between red and grey tiles, just add 16.
			const tileOffset = (aNode.color === "red") ? 16 : 0;
			layer.putTileAt(TILE_IDX_BY_TERRAIN[dirSet] + tileOffset, aNode.x, aNode.y);
		}

		const isTunnel = Boolean(node.tunnel);
		if (isTunnel) {
			for (const tunnelPart of [ node, node.tunnel! ]) {
				const dirSet = tunnelPart.dirSet();
				const layer = (dirSet & HORIZONTAL) > 0 ? this.layer0 : this.layer1;
				drawNodeOnLayer(layer!, tunnelPart);
			}
		}
		else {
			drawNodeOnLayer(this.layer1!, node);
		}
	}

	update(time: number) {
		if (!this.running) return;

		if (time - this.prevTime > MSEC_PER_ITERATION) {
			this.prevTime = time;
			
			let allDone = true;
			if (!this.iter!.next().done) allDone = false;
			if (!this.iter2!.next().done) allDone = false;
			
			if (allDone) {
				this.running = false;
				setTimeout(() => this.reset(), 1000);
			}
		}
	}
}
