import Phaser from 'phaser';

export default class extends Phaser.Scene {
	constructor() {
		super({ key: 'BootScene' });
	}

	preload() {
		this.add.text(100, 100, 'loading...');

		this.load.image('loaderBg', './images/loader-bg.png');
		this.load.image('loaderBar', './images/loader-bar.png');
		this.load.image('pipes', './images/pipes.png');
		this.load.image('mushroom', './images/mushroom2.png');
		this.load.image('tileset', './images/tileset.png');
	}

	update() {
		// this.scene.start('TinsSplash');
		this.scene.start('Level', { loadFromSave: true });
	}

}
