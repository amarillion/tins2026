import Phaser from "phaser";
import { getComponentInfo, TILESET_WIDTH } from "../sim/ComponentInfo";
import { Component, Connector, LevelState } from "../sim/LevelState";
import { Point } from "../util/point";

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

class ComponentView {

	graphics?: Phaser.GameObjects.Graphics;
	text?: Phaser.GameObjects.Text;

	constructor(public component: Component, public scene: Phaser.Scene) {
		const pos = new Point(this.component.mx * TILE_WIDTH, this.component.my * TILE_HEIGHT);
		if (component.componentType === "sincos") {
			this.graphics = scene.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
		}
		if (component.componentType === "monitor" || component.componentType === "integer") {
			const ofst = component.componentType === "monitor" ? 0 : 32;
			this.text = scene.add.text(pos.x + ofst, pos.y, "", {
				fontSize: "11px", color: "#82ff51",
				fixedWidth: 32, fixedHeight: 32,
				align: 'right',
				padding: { x: 2, y: 8 },
			});
		}
	}

	update() {
		const pos = new Point(this.component.mx * TILE_WIDTH, this.component.my * TILE_HEIGHT);
		switch (this.component.componentType) {
			case "sincos": {
				const cx = pos.x + 40;
				const cy = pos.y + 24;
				const a = (this.component.portValues.get('A') ?? 0) * Math.PI * 2;
				const R = 18;
				this.graphics!.clear();
				this.graphics!.lineStyle(1, 0xffffff);
				this.graphics!.strokeLineShape(
					new Phaser.Geom.Line(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R),
				);
				this.graphics!.lineStyle(1, 0xff8251);
				this.graphics!.strokeLineShape(
					new Phaser.Geom.Line(cx + Math.cos(a) * R, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R),
				);
				this.graphics!.lineStyle(1, 0x5182ff);
				this.graphics!.strokeLineShape(
					new Phaser.Geom.Line(cx, cy + Math.sin(a) * R, cx + Math.cos(a) * R, cy + Math.sin(a) * R),
				);
				break;
			}
			case "monitor": {
				this.text!.setText(`${this.component.portValues.get('A') ?? 0}`.slice(0, 4));
				break;
			}
			case "integer": {
				this.text!.setText(`${this.component.value}`.slice(0, 4));
				break;
			}
			default: // ignore
				break;
		}
	}
}

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
	}

	level?: LevelState;

	components: ComponentView[] = [];

	onComponentAdded(comp: Component) {
		this.components.push(new ComponentView(comp, this));
		
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

	update() {
		this.components.forEach(c => c.update());
	}
}
