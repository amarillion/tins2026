import Phaser from "phaser";
import Mushroom from "../sprites/Mushroom";

import levelData from '../data/levels.json';
import { ASTNode, evaluateExpression, Parser } from "../util/parser";

const num = 64;

const VIEWPORT_SIZE = 768;

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function inverseLerp(a: number, b: number, v: number): number {
	return (v - a) / (b - a);
}

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Space' });
	}

	level: number = 0;

	create() {
		this.cameras.main.setBackgroundColor('#000000');
		this.cameras.main.setViewport(1024, 135, VIEWPORT_SIZE, VIEWPORT_SIZE);
		this.level = 9;
		const levelExpression = levelData.levels[this.level].func;
		const parser = new Parser(levelExpression);
		const ast = parser.parse();

		this.createTriggies(ast);
	}

	createTriggies(ast: ASTNode) {
		
		const range = levelData.levels[this.level].range;
		for (let i = 0; i < num; i++) {
			const t = i / num;
			const result = evaluateExpression(ast, { t });
			const x = inverseLerp(range[0], range[2], result.x) * VIEWPORT_SIZE;
			const y = inverseLerp(range[1], range[3], result.y) * VIEWPORT_SIZE;

			const triggie = new Mushroom({ scene: this, x, y, asset: 'mushroom' });
			this.add.existing(triggie);
		}
	}

	preload() {
	}

	update() {
	}

}


