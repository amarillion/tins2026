import Phaser from "phaser";
import { LevelState } from "../sim/LevelState";
import testSaveData from '../data/test-save.json';
import { ToggleButton, ToggleButtonGroup } from "../components/ToggleButton";
import { Button } from "../components/Button";

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Level' });
	}

	levelNo: number = 0;

	playbackMode: string = "Play";
	frameCounter = 0;
	laserStep = 0;

	create(data: { levelNo: number }) {
		this.levelNo = data.levelNo;
		console.log("Started level: ", this.levelNo);

		this.cameras.main.setBackgroundColor('#00ffff');

		const level = new LevelState();
	
		this.time.addEvent({
			delay: 1000 / 60,
			loop: true,
			callback: () => {
				const before = this.laserStep;
				this.frameCounter++;
				switch(this.playbackMode) {
					case "Pause": /* pause: do nothing */ break;
					case "Step": this.laserStep++; this.playbackMode = "Pause"; break;
					case "Slow": if ((this.frameCounter % 10) === 0) this.laserStep++; break;
					case "Play": this.laserStep++; break;
				}
				if (this.laserStep !== before) {
					level?.simulate((this.laserStep % 128) / 128);
				}
			},
		});
	
		this.scene.launch('CircuitBoard', { level });
		this.scene.launch('Space', { level });

		level.loadFromSave(testSaveData);

		this.createGameButtons();
		this.createBuildPalette();
	}

	createGameButtons() {
		{
			const actions = [
				"Quick Load", "Quick Save", "Fire Laser",
			];

		
			let i = 0;
			for (const text of actions) {
				new Button(640 - (3 - i) * 40, 0, text, this, () => {});
				i++;
			}

		}
		
		{
			const group = new ToggleButtonGroup();
			const control = [
				"Pause", "Step", "Slow", "Play",
			];
			let i = 0;
			for (const text of control) {
				new ToggleButton(this,
					640 - (4 - i) * 40, 360 - 16, text, { group, onToggle: () => {
						this.playbackMode = text;
					} },
				);
				i++;
			}
		}
	}
	
	createBuildPalette() {
		const components = [
			"sin-cos", "+", "-", "÷", "✕", "int-frac", "lerp", "clock", "dial", "inc",
			// nice to have:
			"monitor", "abs",
			// maybe
			"if", "<", "neg", "sig", "modulo", "sin", "cos", "atan2", "clock+", "Matrix",
		];

		const other = [
			"Connector", "Delete", "Place",
		];

		const group = new ToggleButtonGroup();

		let xco = 0;
		let yco = 0;
		for (const text of  [ ...components ]) {
			new ToggleButton(this,
				xco * 64, yco * 16, text, { group },
			);
			xco++;
			if (xco > 4) { xco = 0; yco++; }
		}
	}

	preload() {
	}

	update() {
	}

}


