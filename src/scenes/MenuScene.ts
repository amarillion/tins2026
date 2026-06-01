import Phaser from 'phaser';
import { Button } from '../components/Button';
import { hasValidSaveData } from '../sim/SaveData';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'MenuScene' });
	}

	create() {
		this.cameras.main.setBackgroundColor('#000000');

		new Button(this.cameras.main.centerX - 90, this.cameras.main.centerY - 40, 180, 36, "Start Game", this, {
			callback: () => { this.scene.start('Story'); },
			style: { fontSize: '24px' },
		});

		new Button(this.cameras.main.centerX - 90, this.cameras.main.centerY + 4, 180, 36, "Load Game", this, {
			callback: () => { this.scene.start('Level', { loadFromSave: true }); },
			disabled: !hasValidSaveData(),
			style: { fontSize: '24px' },
		});

		// star emitter
		this.add.particles(0, 0, 'flares', {
			frame: { frames: [ 'white' ] },
			blendMode: 'ADD',
			lifespan: 5000,
			scale: 0.05,
			x: 0,
			y: { min: 0, max: this.cameras.main.height },
			speedX: { min: 100, max: 400 },
			speedY: 0,
			quantity: 1,
			advance: 5000,
		});
	}

	preload() {
	}

	update() {
	}

}


