import Phaser from 'phaser';

const FADE_DURATION_MSEC = 1000;
const SHOW_DURATION_MSEC = 2000;

interface SplashChild {
	preload(scene: Phaser.Scene): void,
	create(scene: Phaser.Scene): void,
}

class AbstractSplash extends Phaser.Scene {
	
	constructor(key: string, child: SplashChild, nextSceneKey: string) {
		super({ key });
		this.child = child;
		this.nextSceneKey = nextSceneKey;
	}

	preload() {
		this.child?.preload(this);
	}

	child?: SplashChild;
	nextSceneKey?: string;

	create() {
		this.child?.create(this);

		this.cameras.main.fadeIn(FADE_DURATION_MSEC, 0, 0, 0);
		this.time.delayedCall(FADE_DURATION_MSEC + SHOW_DURATION_MSEC, () => this.startFade());
		
		this.input.keyboard?.once('keydown-SPACE', () => this.startFade());
	}

	private fadeStarted = false;
	startFade() {
		if (!this.fadeStarted) {
			this.fadeStarted = true;
			this.cameras.main.fadeOut(FADE_DURATION_MSEC, 0, 0, 0);

			this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
				this.scene.start(this.nextSceneKey);
			});
		}
	}
}

export class TinsSplash extends AbstractSplash {
	
	constructor() {
		super('TinsSplash', {
			preload(scene: Phaser.Scene) {
				scene.load.image('tins-logo', './images/tinslogo06.png');
			},

			create(scene: Phaser.Scene) {
				scene.cameras.main.setBackgroundColor('#ffffff');

				// TODO: scale up logo.
				scene.add.image(400, 300, 'tins-logo');
			},
		}, 'HelixSplash');
	}

}

export class HelixSplash extends AbstractSplash {

	constructor() {
		super(
			'HelixSplash', {
				preload() {},
				create(scene: Phaser.Scene) {
					scene.cameras.main.setBackgroundColor('#dfd000');

					scene.add.text(100, 100, 'HelixSoft ', {
						font: '64px Bangers',
						color: '#7744ff',
					});
				},
			},
			'MenuScene',
		);
	}

}