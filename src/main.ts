import Phaser from 'phaser';

import BootScene from './scenes/Boot.js';
import SplashScene from './scenes/Splash.js';
import GameScene from './scenes/Game.js';

const gameConfig = {
	type: Phaser.AUTO,
	localStorageName: 'my-game-project',
	backgroundColor: '#ffbbff',
	fps: { target: 60 },
	scale: {
		mode: Phaser.Scale.RESIZE,
	},
	scene: [ BootScene, SplashScene, GameScene ],
};

class Game extends Phaser.Game {
	constructor() {
		super(gameConfig);
	}
}

export const game = new Game();
