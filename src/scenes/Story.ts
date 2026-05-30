import Phaser from "phaser";

const ENSIGN = {
	name: "Ensign Boterham",
};
const CAPTAIN = {
	name: "Captain Raul",
};
const ENGINEER = {
	name: "Chief Engineer Fole",
};

const script = [
	{ who: ENSIGN, text: "Captain. The triggies have grown out of control. They are attacking the ship!" },
	{ who: CAPTAIN, text: "Fire forward lasers!" },
	{ who: ENSIGN, text: "Lasers failed to connect, Captain. The enemy is taking evasive manouvres." },
	{ who: CAPTAIN, text: "Chief engineer Fole, we are powerless here. Can you do something?" },
	{ who: ENGINEER, text: "I cannae change the laws of physics." },
	{ who: CAPTAIN, text: "Just find a loophole!" },
	{ who: ENGINEER, text: "All right, I can try to modulate the laser frequency by rewiring the control module." },
	{ who: CAPTAIN, text: "Make it so." },
	{ who: ENGINEER, text: "It will be ready in just a whiffy." },
];

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'Story' });
	}

	create() {
		this.cameras.main.setBackgroundColor('rgb(68, 50, 0)');
		this.script = this.scriptRunner();

		this.input.keyboard?.once('keydown', () => this.endScene());
	}

	script?: Generator<void>;

	endScene() {
		this.script = undefined;
		this.scene.start('Level', { level: 1 });
	}

	preload() {
	}

	update() {
		if (this.script) {
			const result = this.script.next();
			
			if (result.done) {
				this.endScene();
			}
		}
	}

	dialogText?: Phaser.GameObjects.Text;
	
	showDialog(who: string, text: string) {
		this.dialogText = this.add.text(100, 100, `${who}:\n${text}`, { fontSize: '16px', color: '#ffffff' });
	}
	
	clearDialog() {
		this.dialogText?.destroy();
		this.dialogText = undefined;
	}

	*waitMsec(ms: number) {
		let done = false;
		this.time.delayedCall(ms, () => done = true);
		while (!done) {
			yield;
		}
	}
	
	*scriptRunner() {
		for (const line of script) {
			this.showDialog(line.who.name, line.text);
			yield *this.waitMsec(3500);
			this.clearDialog();
		}
	}
}
