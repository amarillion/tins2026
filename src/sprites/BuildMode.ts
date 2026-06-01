import { getComponentInfo } from "../sim/ComponentInfo";
import { Component, LevelState } from "../sim/LevelState";
import { assert } from "../util/assert";
import { Point } from "../util/point";
import { Signal } from "../util/Signal";

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

export class BuildModeSwitch {

	readonly onBuildModeChange = new Signal<string>();

	currentMode = 'Connectors';
	setBuildMode(value: string) {
		this.currentMode = value;
		this.onBuildModeChange.dispatch(value);
	}
}

const componentTypeMap: Record<string, string> = {
	"sin+cos": "sincos",
	"+": "add",
	"-": "sub",
	"÷": "div",
	"✕": "mul",
	"int+frac": "int_frac",
	"lerp": "lerp",
	"clock": "simple_clock",
	"dial": "integer",
	"increment": "inc",
	"decrement": "dec",
	"monitor": "monitor",
	"abs": "abs",
	"neg": "neg",
	"sign": "sign",
};
		
export class ConnectorBuildMode implements DragHandler {
	
	graphics: Phaser.GameObjects.Graphics;
	
	constructor(public scene: Phaser.Scene, public level: LevelState, public buildModeSwitch: BuildModeSwitch) {
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

		const { currentMode } = this.buildModeSwitch;
		if (currentMode in componentTypeMap) {
			// try to place component at mpos
			const componentType = componentTypeMap[currentMode];
			const size = getComponentInfo(componentType).size;
			if (this.level.isAreaFree(mpos, { x: size[0], y: size[1] } )) {
				const comp = new Component(componentType);
				comp.mx = mpos.x;
				comp.my = mpos.y;
				comp.fixed = false;
				this.level.addComponent(comp);
			}
		}
		else if (currentMode === "Delete") {
			const comp = this.level.findComponentAt(mpos);
			if (comp) {
				this.level.deleteComponent(comp);
				// connectors will be automatically deleted as well.
			}
		}

	}

	mouseDragMove(mpos: Point, delta: Point): void {
		this.toPos = mpos;
	}
	
	mouseDragRelease(mpos: Point): void {
		this.toPos = mpos;

		// Try to build a connector...
		assert(this.fromPos);

		if (this.buildModeSwitch.currentMode === "Connector") {
			if (this.level.findPort(this.fromPos) && this.level.findPort(this.toPos)) {
				this.level.createConnector(this.fromPos, this.toPos);
			}
		}
	}

}