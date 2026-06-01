import { getComponentInfo } from "../sim/ComponentInfo";
import { Component, LevelState } from "../sim/LevelState";
import { assert } from "../util/assert";
import { Point } from "../util/point";
import { Signal } from "../util/Signal";
import Phaser from 'phaser';

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
		this.graphics = scene.add.graphics({
			lineStyle: { width: 2, color: 0x00ff00 },
		});
	}

	redraw() {
		// draw a line from start to end...
	}

	fromPos?: Point;
	toPos?: Point;

	mouseOut() {
		this.graphics.clear();
	}

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
			this.graphics.clear();
		}
		else if (currentMode === "Delete") {
			const comp = this.level.findComponentAt(mpos);
			if (comp && !comp.fixed) {
				this.level.deleteComponent(comp);
				// connectors will be automatically deleted as well.
			}
			this.graphics.clear();
		}

	}

	mouseDragMove(mpos: Point, delta: Point): void {
		
		if (this.buildModeSwitch.currentMode === "Connector") {
			const fromPort = this.level.findPort(this.fromPos!);
			const toPort = this.level.findPort(mpos);
			const isValid = fromPort && toPort && fromPort.portType !== toPort.portType;
			// draw line in green
			this.graphics.clear();
			this.graphics.lineStyle(2, isValid ? 0x00cc00 : 0x0000cc, 0.5);
			this.graphics.strokeLineShape(
				new Phaser.Geom.Line(this.fromPos!.x * 16 + 8, this.fromPos!.y * 16 + 8, mpos.x * 16 + 8, mpos.y * 16 + 8)
			);
		}

		this.toPos = mpos;
	}

	mouseMove(mpos: Point): void {
		const { currentMode } = this.buildModeSwitch;
		if (currentMode in componentTypeMap) {
			// try to place component at mpos
			const componentType = componentTypeMap[currentMode];
			const size = getComponentInfo(componentType).size;
			const isValid = this.level.isAreaFree(mpos, { x: size[0], y: size[1] } );
			this.graphics.clear();
			this.graphics.fillStyle(isValid ? 0x00cc00 : 0xcc0000, 0.5);
			this.graphics.fillRect(mpos.x * 16, mpos.y * 16, size[0] * 16, size[1] * 16);
		}
		else if (currentMode === "Delete") {
			const comp = this.level.findComponentAt(mpos);
			if (comp && !comp.fixed) {
				const info = getComponentInfo(comp.componentType);
				this.graphics.clear();
				this.graphics.fillStyle(0xcc0000, 0.5);
				this.graphics.fillRect(comp.mx * 16, comp.my * 16, info.size[0] * 16, info.size[1] * 16);
			}
		}
	}
	
	mouseDragRelease(mpos: Point): void {
		this.toPos = mpos;

		// Try to build a connector...
		assert(this.fromPos);

		if (this.buildModeSwitch.currentMode === "Connector") {
			this.graphics.clear();
			const fromPort = this.level.findPort(this.fromPos!);
			const toPort = this.level.findPort(mpos);
			const isValid = fromPort && toPort && fromPort.portType !== toPort.portType;
			if (isValid) {
				this.level.createConnector(this.fromPos, this.toPos);
			}
		}
	}

}