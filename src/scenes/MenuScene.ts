import Phaser from 'phaser';

class Button {
	constructor(x: number, y: number, label: string, scene: Phaser.Scene, callback: () => void) {
		const button = scene.add.text(x, y, label);
		button
			.setOrigin(0.5, 0.5)
			.setPadding(10)
			.setStyle({ backgroundColor: '#111' })
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', () => callback())
			.on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
			.on('pointerout', () => button.setStyle({ fill: '#fff' }));
	}
}

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


