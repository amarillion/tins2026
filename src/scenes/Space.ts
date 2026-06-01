import Phaser from "phaser";
import { Triggie } from "../sprites/Triggie.js";

import { LevelState, TriggieData } from "../sim/LevelState";
import { assert } from "../util/assert.js";

export const VIEWPORT_SIZE = 320;
export const MARGIN = 20;

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Space' });
	}

	level?: LevelState;

	create(data: { level: LevelState }) {
		this.cameras.main.setBackgroundColor('#000000');
		this.cameras.main.setViewport(320, 16, VIEWPORT_SIZE, VIEWPORT_SIZE + 28);
			
		this.level = data.level;

		this.level.onCreateTriggie(t => this.createTriggie(t));

		this.level.onLaser.add(({x, y}) => this.setLaser(x, y));

		this.emitter = this.add.particles(0, 0, 'flares', {
			frame: { frames: [ 'red', 'green', 'blue', 'white', 'yellow' ], cycle: true },
			blendMode: 'ADD',
			lifespan: 500,
			scale: { start: 0.2, end: 0.05 },
		});

		const container = this.add.sprite(0, VIEWPORT_SIZE-16, 'container').setOrigin(0, 0);
		this.level.onLaserCycleComplete.add(isWin => {
			if (isWin) {
				this.time.delayedCall(500, () => {
					container.play('cracked');
					this.cameras.main.shake(2500, 0.01);
				});
			}
			this.time.delayedCall(3000, () => {
				assert(this.level);
				if (isWin) {
					for (const trig of this.level.triggies) {
						trig.clear('explode');
					}
				}
				else {
					// let all trigges return
					for (const trig of this.level.triggies) {
						trig.clear('return');
					}
				}
			});
			
		});
	}

	emitter?: Phaser.GameObjects.Particles.ParticleEmitter;

	createTriggie(t: TriggieData) {
		const triggie = new Triggie(this, t);
		this.add.existing(triggie);
	}

	setLaser(x: number, y: number) {
		if (this.emitter) {
			// TODO: tween?
			this.emitter.particleX = (x * (VIEWPORT_SIZE - (MARGIN * 2))) + MARGIN;
			this.emitter.particleY = VIEWPORT_SIZE - MARGIN - (y * (VIEWPORT_SIZE - (MARGIN * 2)));
		}
	}

	preload () {
	}

	update() {
	}

}


