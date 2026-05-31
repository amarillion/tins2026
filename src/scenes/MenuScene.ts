import Phaser from 'phaser';
import { Button } from '../components/Button';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'MenuScene' });
	}

	create() {
		this.cameras.main.setBackgroundColor('#ff0000');

		new Button(this.cameras.main.centerX - 90, this.cameras.main.centerY - 40, 180, 36, "Start Game", this, {
			callback: () => { this.scene.start('Story'); },
			style: { fontSize: '24px' },
		});
		new Button(this.cameras.main.centerX - 90, this.cameras.main.centerY + 4, 180, 36, "Load Game", this, {
			callback: () => { this.scene.start('Level', { level: 5 }); },
			style: { fontSize: '24px' },
		});
	}

	preload() {
	}

	update() {
	}

}


