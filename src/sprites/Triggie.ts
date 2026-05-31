import Phaser from 'phaser';
import { TriggieData, TriggieEvent } from '../sim/LevelState';
import { VIEWPORT_SIZE } from '../scenes/Space';

export class Triggie extends Phaser.GameObjects.Sprite {
	
	model: TriggieData;
	currentTween?: Phaser.Tweens.Tween;

	constructor(scene: Phaser.Scene, model: TriggieData) {
		super(scene, model.x * VIEWPORT_SIZE, model.y * VIEWPORT_SIZE, 'mushroom');
		this.setScale(0.25, 0.25);
		model.onEvent.add(data => this.onHit(data));
		this.model = model;
	}

	onHit({ event }: TriggieEvent) {
		if (event === 'dead') {
			this.moveToContainer();
		}
		else if (event === 'return') {
			this.goBack();
		}
		else if (event === 'explode') {
			this.explode();
		}
	}

	goBack() {
		if (this.currentTween) {
			this.currentTween.stop();
		}
		this.scene.tweens.add({
			targets: this,
			x: this.model.x * VIEWPORT_SIZE,
			y: this.model.y * VIEWPORT_SIZE,
			ease: 'Power1',
			duration: 1000,
		});
	}

	explode() {
		if (this.currentTween) {
			this.currentTween.stop();
		}
		this.scene.tweens.add({
			targets: this,
			x: Math.random() * VIEWPORT_SIZE,
			y: 0 - Math.random() * VIEWPORT_SIZE,
			ease: 'Power1',
			duration: 1000,
		});
	}

	moveToContainer() {
		this.currentTween = this.scene.tweens.add({
			targets: this,
			x: Math.random() * 4,
			y: VIEWPORT_SIZE - Math.random() * 4,
			ease: 'Power1',
			duration: 1000,
			onComplete: () => this.containerMode(),
		});
	}

	containerMode() {
		this.currentTween = this.scene.tweens.add({
			targets: this,
			x: VIEWPORT_SIZE - Math.random() * 4,
			y: VIEWPORT_SIZE - Math.random() * 4,
			ease: 'Sine.easeInOut',
			duration: 1000,
			yoyo: true,
			loop: -1,
		});
	}
}
