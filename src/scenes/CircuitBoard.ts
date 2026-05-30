import Phaser from "phaser";
import testSaveData from '../data/test-save.json';
import { getComponentInfo, TILESET_WIDTH } from "../sim/ComponentInfo";
import { Component, Connector, LevelState } from "../sim/LevelState";

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

export class CircuitBoard extends Phaser.Scene {

	map: Phaser.Tilemaps.Tilemap | null = null;
	layer0: Phaser.Tilemaps.TilemapLayer | null = null;
	connectorGraphics: Phaser.GameObjects.Graphics | null = null;

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

	create() {
		this.cameras.main.setBackgroundColor('#73d484');
		this.cameras.main.setViewport(0, 64, 16*20, 16*15);

		this.reset();


		// TODO: move out of constructor
		const level = new LevelState();
		level.onComponentAdded((c: Component) => this.onComponentAdded(c));
		level.onConnectorAdded((con: Connector) => this.onConnectorAdded(con));
		level.loadFromSave(testSaveData);
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

	update(time: number) {
		// TODO: visualizations
	}
}
