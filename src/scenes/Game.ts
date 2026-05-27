import Phaser from 'phaser';

import Mushroom from '../sprites/Mushroom.ts';

export default class extends Phaser.Scene {
	private mushroom: Mushroom | null = null;

	constructor() {
		super({ key: 'GameScene' });
	}

	init() {}
	preload() {}

	create() {
		this.mushroom = new Mushroom({
			scene: this,
			x: 400,
			y: 300,
			asset: 'mushroom',
		});

		this.add.existing(this.mushroom);
		this.add.text(100, 100, 'Phaser 3 - TypeScript - Vite ', {
			font: '64px Bangers',
			color: '#7744ff',
		});
	}
}
