import { Game } from "phaser-ce";

type PathStep = { move: [number, number] } | { cubic: [number, number, number, number, number, number] };

function createBubblePoints(w: number, h: number): PathStep[] {
	// d="M 100,50 C 
	// 100,70 98,80 92,88 
	// 92,89 96,97 100,100 
	// 87,100 87,92 85,93 
	// 78,98 68,100 50,100 
	// 5,100 0,95 0,50 0,6 7,0 50,0 c 41,0 50,9 50,50 z"
	const base = Math.min(w, h);
	return [
		{ move: [ w, 0.5 * h]}, // right side
		{ cubic: [ w, h - 0.30 * base, w - 0.02 * base, h - 0.20 * base, w - 0.08 * base, h - 0.12 * base ] },
		{ cubic: [ w - 0.08 * base, h - 0.11 * base, w - 0.04 * base, h - 0.03 * base, w, h ] }, // pointy tip
		{ cubic: [ w - 0.13 * base, h, w - 0.13 * base, h - 0.08 * base, w - 0.15 * base, h - 0.07 * base ]},
		{ cubic: [ w - 0.22 * base, h - 0.02 * base, w - 0.32 * base, h, w * 0.5, h ] }, // bottom side
		{ cubic: [ 0.05 * base, h, 0, h - 0.05*base, 0, h * 0.5 ]}, // left side
		{ cubic: [ 0, base * 0.06, 0.07 * base, 0, w * 0.5, 0 ]}, // top side
		{ cubic: [ w - 0.09 * base, 0, w, 0.09 * base, w, h * 0.5 ]}, // back to right side
	];
}

export class PhaserSpeechBubble extends Phaser.Group {

	private bubble: Phaser.Graphics;
	private speech: Phaser.Text;

	constructor(game: Game, x: number, y: number, w: number, h: number, text: string) {
		super(game);

		this.bubble = new Phaser.Graphics(game, 0, 0);
		this.bubble.beginFill(0xFFFFFF, 1);
		this.bubble.lineStyle(4.0, 0x000000, 1);
		const path = createBubblePoints(w, h);
		for (const step of path) {
			if ("move" in step) {
				this.bubble.moveTo(step.move[0], step.move[1]);
			}
			else if ("cubic" in step) {
				this.bubble.bezierCurveTo(step.cubic[0], step.cubic[1], step.cubic[2], step.cubic[3], step.cubic[4], step.cubic[5]);
			}
		}
		this.bubble.endFill();
		this.add(this.bubble);

		const MARGIN = 30;
		this.speech = new Phaser.Text(game, 0, 0, text, { 
			font: "Sans Serif",
			fontSize: 24,
			wordWrap: true,
			fill: "#000000",
			align: "center",
			wordWrapWidth: w - (MARGIN * 2),
			boundsAlignV: "center",
			boundsAlignH: "middle" // TODO: vertical alginment seems broken in Phaser...
		});
		this.speech.setTextBounds(MARGIN, MARGIN, w - 2 * MARGIN, h - 2 * MARGIN);
		this.add(this.speech);

		this.position.setTo(x, y);
	}

}