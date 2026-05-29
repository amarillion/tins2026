import Phaser from "phaser";
import Mushroom from "../sprites/Mushroom";

// level config
const yFunc = (t: number) => 0.5 + (0.5 * Math.sin(6.282 * t));
const xFunc = (t: number) => t;
const num = 64;

const VIEWPORT_SIZE = 768;

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Space' });
	}

	create() {
		this.cameras.main.setBackgroundColor('#000000');
		this.cameras.main.setViewport(1024, 135, VIEWPORT_SIZE, VIEWPORT_SIZE);

		this.createTriggies();
	}

	createTriggies() {
		for (let i = 0; i < num; i++) {
			const t = i / num;
			const x = xFunc(t) * VIEWPORT_SIZE;
			const y = yFunc(t) * VIEWPORT_SIZE;

			const triggie = new Mushroom({ scene: this, x, y, asset: 'mushroom' });
			this.add.existing(triggie);
		}
	}

	preload() {
	}

	update() {
	}

}


