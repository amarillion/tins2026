import { LevelState } from "../sim/LevelState";
import { assert } from "../util/assert";
import { Point } from "../util/point";

interface DragHandler {
	mouseDragStart(mpos: Point): void,
	/**
	 * @param mx
	 * @param my
	 * @param deltaX horizontal pixels moved since previous invocation
	 * @param deltaY vertical pixels moved since previous invocation
	 */
	mouseDragMove(mpos: Point, delta: Point): void,
	
	mouseDragRelease(mpos: Point): void,
}


export class ConnectorBuildMode implements DragHandler {
	
	level: LevelState;
	graphics: Phaser.GameObjects.Graphics;

	constructor(scene: Phaser.Scene, level: LevelState) {
		this.level = level;
		this.graphics = scene.add.graphics({});
	}

	redraw() {
		// draw a line from start to end...
	}

	fromPos?: Point;
	toPos?: Point;

	mouseDragStart(mpos: Point): void {
		this.fromPos = mpos;
	}
	mouseDragMove(mpos: Point, delta: Point): void {
		this.toPos = mpos;
	}
	mouseDragRelease(mpos: Point): void {
		this.toPos = mpos;

		// Try to build a connector...
		assert(this.fromPos);

		if (this.level.findPort(this.fromPos) && this.level.findPort(this.toPos)) {
			this.level.createConnector(this.fromPos, this.toPos);
		}
	}

}