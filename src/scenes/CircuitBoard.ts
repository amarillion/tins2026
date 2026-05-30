import Phaser from "phaser";
import { getComponentInfo, TILESET_WIDTH } from "../sim/ComponentInfo";
import { Component, Connector, LevelState } from "../sim/LevelState";

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

export class CircuitBoard extends Phaser.Scene {

	map: Phaser.Tilemaps.Tilemap | null = null;
	layer0: Phaser.Tilemaps.TilemapLayer | null = null;
	connectorGraphics: Phaser.GameObjects.Graphics | null = null;
	componentGfxMap = new Map<string, Phaser.GameObjects.Graphics>();

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

		this.connectorGraphics = this.add.graphics({ lineStyle: { width: 5, color: 0xaa1100, alpha: 0.5 } });
		this.connectorGraphics?.clear();
	}

	create(data: { level: LevelState }) {
		this.cameras.main.setBackgroundColor('#73d484');
		this.cameras.main.setViewport(0, 64, 16*20, 16*15);

		this.reset();

		console.log("Data passed: ", { data });
		this.level = data.level;

		this.level.onComponentAdded((c: Component) => this.onComponentAdded(c));
		this.level.onConnectorAdded((con: Connector) => this.onConnectorAdded(con));
		this.level.onComponentUpdate((c: Component, d: Map<string, number>) => this.onComponentUpdate(c, d));
	}

	level?: LevelState;


	onComponentUpdate(c: Component, data: Map<string, number>) {
		const pos = [ c.mx * TILE_WIDTH, c.my * TILE_HEIGHT ];

		const id = `${c.mx}-${c.my}-${c.componentType}`;

		switch (c.componentType) {
			case "sincos": {
				if (!this.componentGfxMap.has(id)) {
					const componentGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
					this.componentGfxMap.set(id, componentGraphics);
					console.log(`Created component graphics for ${id}, count: ${this.componentGfxMap.size}`);
				}
				const componentGraphics = this.componentGfxMap.get(id)!;
				componentGraphics.clear();
				
				const cx = pos[0] + 40;
				const cy = pos[1] + 24;
				const a = (data.get('A') ?? 0) * Math.PI * 2;
				const R = 18;
				componentGraphics.strokeLineShape(
					new Phaser.Geom.Line(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R),
				);
				componentGraphics.strokeLineShape(
					new Phaser.Geom.Line(cx + Math.cos(a) * R, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R),
				);
				componentGraphics.strokeLineShape(
					new Phaser.Geom.Line(cx, cy + Math.sin(a) * R, cx + Math.cos(a) * R, cy + Math.sin(a) * R),
				);
				break;
			}
			default: // ignore
				break;
		}
	}

	onComponentAdded(comp: Component) {
		
		function drawComponent(layer: Phaser.Tilemaps.TilemapLayer, x: number, y: number, type: string) {
			const info = getComponentInfo(type);
			for (let dx = 0; dx < info.size[0]; dx++) {
				for (let dy = 0; dy < info.size[1]; dy++) {
					layer.putTileAt(info.tileIdx + dx + TILESET_WIDTH * dy, x + dx, y + dy);
				}
			}
		}

		drawComponent(this.layer0!, comp.mx, comp.my, comp.componentType);
	}

	onConnectorAdded(con: Connector) {
		const line = new Phaser.Geom.Line(
			(con.from[0] + 0.5) * TILE_WIDTH, (con.from[1] + 0.5) * TILE_HEIGHT,
			(con.to[0] + 0.5) * TILE_WIDTH, (con.to[1] + 0.5) * TILE_HEIGHT,
		);
		this.connectorGraphics?.strokeLineShape(line);
	}

	counter = 0;

	update(time: number) {
		// TODO: visualizations
	}
}
