import Phaser from 'phaser';

export default class extends Phaser.Scene {
	constructor() {
		super({ key: 'BootScene' });
	}

	preload() {
		this.add.text(100, 100, 'loading...');

		this.load.image('loaderBg', './images/loader-bg.png');
		this.load.image('loaderBar', './images/loader-bar.png');
		this.load.spritesheet('triggies', './images/Triggies.png', { frameWidth: 20, frameHeight: 20 });
		this.load.image('tileset', './images/tileset.png');
		this.load.image('scene1', './images/Scene1.png');
		this.load.image('scene2', './images/Scene2.png');
		this.load.image('scene3', './images/Scene3.png');
		this.load.spritesheet('portraits', './images/portraits.png', { frameWidth: 64, frameHeight: 64 });
		this.load.atlas('flares', 'images/flares.png', 'images/flares.json');
	}

	create() {
		const frameData = {
			"red": [ 0 , 1 ],
			"blue": [ 2, 3 ],
			"green": [ 4, 5 ],
			"brown": [ 6, 7 ],
			"grey": [ 8, 9 ],
			"moss": [ 10, 11 ],
		};
		for (const [ key, frameIdxs ] of Object.entries(frameData)) {
			this.anims.create({
				key,
				repeat: -1,
				frames: frameIdxs.map(i => ({ key: "triggies", frame: i, duration: 500 })),
			});
		}

		const params = new URLSearchParams(window.location.search);
		if (params.has("debug")) {
			// parse request params
			const levelNo = params.get("level") ?? "0";
			this.scene.start('Level', { levelNo: parseInt(levelNo) });
		}
		else {
			this.scene.start('TinsSplash');
		}
	}

}
