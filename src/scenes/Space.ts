import Phaser from "phaser";
import Mushroom from "../sprites/Mushroom";

import { LevelState, TriggieData } from "../sim/LevelState";

const VIEWPORT_SIZE = 320;

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Space' });
	}

	level?: LevelState;

	create(data: { level: LevelState }) {
		this.cameras.main.setBackgroundColor('#000000');
		this.cameras.main.setViewport(320, 24, VIEWPORT_SIZE, VIEWPORT_SIZE);
			
		this.level = data.level;

		this.level.onCreateTriggie(t => this.createTriggie(t));

		this.level.onLaser.add(({x, y}) => this.setLaser(x, y));

		this.emitter = this.add.particles(0, 0, 'flares', {
			frame: { frames: [ 'red', 'green', 'blue', 'white', 'yellow' ], cycle: true },
			blendMode: 'ADD',
			lifespan: 500,
			scale: { start: 0.2, end: 0.05 },
		});
	}

	emitter?: Phaser.GameObjects.Particles.ParticleEmitter;

	createTriggie(t: TriggieData) {
		const triggie = new Mushroom({ scene: this,
			x: t.x * VIEWPORT_SIZE,
			y: t.y * VIEWPORT_SIZE, asset: 'mushroom' });
		this.add.existing(triggie);
	}

	setLaser(x: number, y: number) {
		if (this.emitter) {
			// TODO: tween?
			this.emitter.particleX = x * VIEWPORT_SIZE;
			this.emitter.particleY = y * VIEWPORT_SIZE;
		}
	}

	preload () {
		this.load.atlas('flares', 'images/flares.png', 'images/flares.json');
	}

	update() {
	}

}


