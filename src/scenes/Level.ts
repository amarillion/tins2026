import Phaser from "phaser";

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Level' });
	}

	level: number = 0;

	create(data: { level: number }) {
		this.level = data.level;
		console.log("Started level: ", this.level);

		this.cameras.main.setBackgroundColor('#00ffff');

		this.scene.launch('Maze');
		this.scene.launch('Space');
	}

	preload() {
	}

	update() {
	}

}


