import { assert } from "@amarillion/helixgraph/lib/assert.js";
import { TemplateGrid } from "@amarillion/helixgraph/lib/BaseGrid.js";
import Phaser from "phaser";
import componentInfo from '../data/components.json';

const MSEC_PER_ITERATION = 20;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;

export class CircuitBoard extends Phaser.Scene {

	map: Phaser.Tilemaps.Tilemap | null = null;
	layer0: Phaser.Tilemaps.TilemapLayer | null = null;
	
	constructor() {
		super({ key: "CircuitBoard" });
	}

	preload() {
		this.load.image("tileset", "tileset.png");
	}

	reset() {
		if (this.map) this.map.destroy();
		
		const mw = 20;
		const mh = 15;
		
		this.map = this.make.tilemap({ tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT, width: mw, height: mh });
		const tiles = this.map.addTilesetImage("tileset");
		this.layer0 = this.map.createBlankLayer("layer0", tiles!);
	}

	create() {
		// TODO: game constants...
		this.cameras.main.setBackgroundColor('#73d484');
		this.cameras.main.setViewport(0, 136, 16*20, 16*15);

		this.reset();
	}

	onChange(node: Node) {
		function drawComponent(layer: Phaser.Tilemaps.TilemapLayer, x: number, y: number, type: string) {
			const comp = componentInfo[type];
			
			
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
