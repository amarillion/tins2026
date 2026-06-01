import Phaser from "phaser";
import { LevelState } from "../sim/LevelState";
import { Button, ToggleButton, ToggleButtonGroup } from "../components/Button";
import levelData from '../data/levels.json';
import { getQuickSaveData, saveGameData } from "../sim/SaveData";
import { assert } from "../util/assert";
import { BuildModeSwitch } from "../sprites/BuildMode";

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Level' });
	}

	playbackMode: string = "Play";
	frameCounter = 0;
	laserStep = 0;

	level?: LevelState;
	buildModeSwitch? : BuildModeSwitch;

	create(data: { levelNo?: number, loadFromSave?: boolean }) {
		this.cameras.main.setBackgroundColor('#00ffff');

		const level = new LevelState();
		this.level = level;
		this.level.onLevelComplete.addOnce(() => this.onLevelComplete());

		this.buildModeSwitch = new BuildModeSwitch();
		
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
					case "Play": if ((this.frameCounter % 2) === 0) this.laserStep++; break;
					case "Fire": this.laserStep++; if (this.level?.laserKillRemain === 0) this.playbackMode = this.oldPlaybackMode; break;
				}
				if (this.laserStep !== before) {
					level?.simulate((this.laserStep % 128) / 128);
				}
			},
		});
	
		this.scene.launch('CircuitBoard', { level, buildModeSwitch: this.buildModeSwitch });
		this.scene.launch('Space', { level });

		if (data.loadFromSave) {
			level.loadFromSave(getQuickSaveData());
		}
		else {
			level.emptyStart(data.levelNo ?? 0);
		}
		
		console.log("Started level: ", level.currentLevel);
		level.initializeTriggies();

		this.createGameButtons();
		this.createBuildPalette();
	}

	oldPlaybackMode: string = 'Play';

	onLevelComplete() {
		this.time.addEvent({
			delay: 1000,
			callback: () => {
				assert(this.level);
				if (this.level.currentLevel === levelData.levels.length) {
					// TODO: Congratulations screen
				}
				else {
					this.scene.start('Level', { levelNo: this.level.currentLevel + 1 });
				}
			},
		});
	}

	createGameButtons() {
		{
			const actions: [string, () => void][] = [
				[ "Quick Load", () => {
					this.scene.start('Level', { loadFromSave: true });
				} ],
				[ "Quick Save", () => {
					saveGameData(this.level!.asSaveData());
				} ],
				[ "Fire Laser", () => {
					this.oldPlaybackMode = this.playbackMode;
					this.playbackMode = "Fire";
					if (this.level) this.level.fireLaser();
				} ],
			];

			let i = 0;
			for (const [ text, callback ] of actions) {
				new Button(640 - (3 - i) * 80, 0, 80, 16, text, this, { callback });
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
					640 - (4 - i) * 40, 360 - 16, 40, 16, text, { group, onToggle: () => {
						this.playbackMode = text;
					} },
				);
				i++;
			}
		}
	}
	
	createBuildPalette() {
		const components = [
			"sin+cos", "+", "-", "÷", "✕", "int+frac", "lerp", "clock", "dial", "increment",
			// nice to have:
			"monitor", "abs", "decrement", "neg", "sign",
			// maybe
			// "if", "<", "modulo", "sin", "cos", "atan2", "clock+", "Matrix",
		];

		const other = [
			"Connector", "Delete",
		];

		const group = new ToggleButtonGroup();

		let xco = 0;
		let yco = 0;
		for (const text of  [ ...components, ...other ]) {
			new ToggleButton(this,
				xco * 64, yco * 16, 64, 16, text, {
					group,
					onToggle: (isPressed: boolean) => { if (isPressed) { this.buildModeSwitch?.setBuildMode(text); } },
				},
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


