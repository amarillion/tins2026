import Phaser from "phaser";
import { LevelState } from "../sim/LevelState";
import testSaveData from '../data/test-save.json';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Level' });
	}

	levelNo: number = 0;

	create(data: { levelNo: number }) {
		this.levelNo = data.levelNo;
		console.log("Started level: ", this.levelNo);

		this.cameras.main.setBackgroundColor('#00ffff');

		const level = new LevelState();
	
		this.time.addEvent({
			delay: 100,
			loop: true,
			callback: () => level?.simulate(((this.counter++) % 128) / 128),
		});
	
		this.scene.launch('CircuitBoard', { level });
		this.scene.launch('Space', { level });

		level.loadFromSave(testSaveData);
	}

	counter = 0;

	preload() {
	}

	update() {
	}

}


