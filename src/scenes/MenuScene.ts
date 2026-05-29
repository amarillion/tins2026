import Phaser from 'phaser';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'MenuScene' });
	}

	create() {
		this.cameras.main.setBackgroundColor('#ff0000');

		const startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Start Game");
		// TODO: styling
		startButton.addListener('click', () => {
			console.log("Click!");
			this.scene.start('Maze');
		});
	}

	preload() {
	}

	update() {
	}

}


