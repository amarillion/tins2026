import Phaser from "phaser";
import Mushroom from "../sprites/Mushroom";

import levelData from '../data/levels.json';
import { ASTNode, evaluateScript, Parser } from "../util/parser";
import { inverseLerp } from "../util/math";
import { LevelState } from "../sim/LevelState";

const num = 64;

const VIEWPORT_SIZE = 320;

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Space' });
	}

	levelNo: number = 0;

	create(data: { level: LevelState }) {
		this.cameras.main.setBackgroundColor('#000000');
		this.cameras.main.setViewport(320, 24, VIEWPORT_SIZE, VIEWPORT_SIZE);
		this.levelNo = 7;
		const levelExpression = levelData.levels[this.levelNo].func;
		const parser = new Parser(levelExpression);
		const ast = parser.parse();

		this.createTriggies(ast);

		data.level.onLaser((dataMap: Map<string, number>) => this.setLaser(dataMap));

		this.emitter = this.add.particles(0, 0, 'flares', {
			frame: { frames: [ 'red', 'green', 'blue', 'white', 'yellow' ], cycle: true },
			blendMode: 'ADD',
			lifespan: 500,
			scale: { start: 0.2, end: 0.05 },
		});
	}

	emitter?: Phaser.GameObjects.Particles.ParticleEmitter;

	createTriggies(ast: ASTNode) {
		
		const range = levelData.levels[this.levelNo].range;
		for (let i = 0; i < num; i++) {
			const t = i / num;
			const result = evaluateScript(ast, { t });
			const x = inverseLerp(range[0], range[2], result.x) * VIEWPORT_SIZE;
			const y = inverseLerp(range[1], range[3], result.y) * VIEWPORT_SIZE;

			const triggie = new Mushroom({ scene: this, x, y, asset: 'mushroom' });
			this.add.existing(triggie);
		}
	}

	setLaser(dataMap: Map<string, number>) {
		const x = dataMap.get("X") ?? 0;
		const y = dataMap.get("Y") ?? 0;

		const range = levelData.levels[this.levelNo].range;
		if (this.emitter) {
			// TODO: tween?
			this.emitter.particleX = inverseLerp(range[0], range[2], x) * VIEWPORT_SIZE;
			this.emitter.particleY = inverseLerp(range[0], range[2], y) * VIEWPORT_SIZE;
		}
	}

	preload () {
		this.load.atlas('flares', 'images/flares.png', 'images/flares.json');
	}

	update() {
	}

}


