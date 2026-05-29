import Phaser from 'phaser';

import BootScene from './scenes/Boot.js';
import { Maze } from './scenes/Maze.js';
import { TinsSplash, HelixSplash } from './scenes/Splash.js';
import MenuScene from './scenes/MenuScene.js';

const gameConfig = {
	type: Phaser.AUTO,
	localStorageName: 'my-game-project',
	backgroundColor: '#421a42',
	fps: { target: 60 },
	scale: {
		mode: Phaser.Scale.RESIZE,
	},
	scene: [ BootScene, HelixSplash, TinsSplash, MenuScene, Maze ],
};

class Game extends Phaser.Game {
	constructor() {
		super(gameConfig);
	}
}

export const game = new Game();
