import Phaser from 'phaser';

export default class extends Phaser.GameObjects.Sprite {
	constructor({ scene, x, y, asset }: { scene: Phaser.Scene, x: number, y: number, asset: string }) {
		super(scene, x, y, asset);
	}
}
