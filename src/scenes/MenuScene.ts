import Phaser from 'phaser';
import { Button } from '../components/Button';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'MenuScene' });
	}

	create() {
		this.cameras.main.setBackgroundColor('#ff0000');

		new Button(this.cameras.main.centerX, this.cameras.main.centerY, "Start Game", this, () => {
			this.scene.start('Level', { level: 5 });
		});
	}

	preload() {
	}

	update() {
	}

}


