import testSave from '../data/test-save.json';
import allLevels from '../data/levels.json';
import { ComponentInfo, getComponentInfo } from './ComponentInfo';
import { ASTNode, evaluateExpression, evaluateScript, Parser } from '../util/parser';
import levelData from '../data/levels.json';
import { inverseLerp } from '../util/math';
import { Signal } from '../util/Signal';
import { Point } from '../util/point';

export type TriggieEvent = {
	event: 'hit' | 'dead' | 'return' | 'explode',
};

export class TriggieData {
	
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	
	readonly onEvent = new Signal<TriggieEvent>();

	hit() {
		this.hits++;
		if (this.hits === 1) {
			this.onEvent.dispatch({ event: 'hit' });
		}
		else if (this.hits === 2) {
			this.onEvent.dispatch({ event: 'dead' });
		}
	}

	clear(event : 'explode' | 'return') {
		this.hits = 0;
		this.onEvent.dispatch({ event });
	}

	x = 0;
	y = 0;
	hits = 0;
}

type CBCreateTriggie = (t: TriggieData) => void;

const NUM_TRIGGIES = 64;

export class Component {

	info: ComponentInfo;
	componentType: string;
	fixed = false; /* whether this can be deleted or not */
	mx = 0;
	my = 0;
	rotation = 0; /* 0-3 */
	value = 0; // used for dials.

	connectorMap = new Map<string, Connector[]>();

	constructor(componentType: string) {
		this.info = getComponentInfo(componentType);
		this.componentType = componentType;
	}

	connect(portName: string, connector: Connector) {
		console.log(`Connecting component ${this.componentType} port ${portName}`);
		if (this.connectorMap.has(portName)) {
			this.connectorMap.get(portName)!.push(connector);
		} else {
			this.connectorMap.set(portName, [ connector ]);
		}
	}
}

export class Connector {
	from: [number, number] = [ 0, 0 ];
	to: [number, number] = [ 0, 0 ];
	fromComponent?: Component;
	fromPort?: string;

	toComponent?: Component;
	toPort?: string;
}

export class LevelState {

	currentLevel = 0;

	connectors: Connector[] = [];
	components: Component[] = [];

	levelInfo = allLevels.levels[3];

	loadFromSave(data: typeof testSave) {

		this.currentLevel = data.saveData.currentLevel;

		for (const rawComp of data.saveData.components) {
			const comp = new Component(rawComp.type);
			comp.mx = rawComp.x;
			comp.my = rawComp.y;
			comp.rotation = rawComp.rotation;
			comp.fixed = Boolean(rawComp.fixed);

			if ('data' in rawComp && 'value' in rawComp.data!) {
				comp.value = rawComp.data.value;
			}

			this.addComponent(comp);
		}

		for (const rawCon of data.saveData.connectors) {
			const con = new Connector();
			con.from[0] = rawCon.from[0];
			con.from[1] = rawCon.from[1];
			con.to[0] = rawCon.to[0];
			con.to[1] = rawCon.to[1];

			// find matching port, if any...
			for (const comp of this.components) {
				const ports = Object.entries(comp.info.ports);
				for (const [ portName, portInfo ] of ports) {
					console.log(`Checking component ${comp.componentType} port ${portName} at (${comp.mx + portInfo.delta[0]}, ${comp.my + portInfo.delta[1]}) against connector from (${con.from[0]}, ${con.from[1]}) to (${con.to[0]}, ${con.to[1]})`);
					const portX = comp.mx + portInfo.delta[0];
					const portY = comp.my + portInfo.delta[1];
					if (portX === con.from[0] && portY === con.from[1]) {
						con.fromComponent = comp;
						con.fromPort = portName;
						comp.connect(portName, con);
						break;
					}
					if (portX === con.to[0] && portY === con.to[1]) {
						con.toComponent = comp;
						con.toPort = portName;
						comp.connect(portName, con);
						break;
					}
				}
			}

			this.addConnector(con);
		}
	}

	simulate(t: number) {

		// first create empty port states
		const portValues = new Map<Component, Map<string, number>>();
		const globalValues = new Map<string, number>();
		const visitedComponents = new Set<Component>();

		function componentReady(comp: Component): boolean {
			const ports = Object.entries(comp.info.ports);
			for (const [ portName, portInfo ] of ports) {
				if (portInfo.type === "in") {
					if (!(portValues.get(comp)?.has(portName))) {
						return false;
					};
				}
			}
			return true;
		}

		const openComponents: Component[] = this.components.filter(c => componentReady(c));

		while (openComponents.length > 0) {
			const comp = openComponents.shift()!;
			visitedComponents.add(comp);

			const data = new Map<string, number>();
			const ports = Object.entries(comp.info.ports);
			for (const [ portName, portInfo ] of ports) {
				if (portInfo.type === "in") {
					data.set(portName, portValues.get(comp)!.get(portName)!);
				}
			}

			data.set("t", t);
			if (comp.value !== undefined) {
				data.set("v", comp.value);
			}

			for (const [ portName, portInfo ] of ports) {
				if (portInfo.type === "out") {
					const ast = new Parser(portInfo.calc!).parse();
					const value = evaluateExpression(ast, Object.fromEntries(data));
					data.set(portName, value);

					// console.log(`Component ${comp.componentType} port ${portName} calculated value: ${value}`);
					// now propagate to connected components
					const connectors = comp.connectorMap.get(portName) || [];
					for (const con of connectors) {
						const otherComp = con.toComponent;
						const otherPort = con.toPort;
						if (otherComp && otherPort) {
							if (!portValues.has(otherComp)) {
								portValues.set(otherComp, new Map<string, number>());
							}
							portValues.get(otherComp)!.set(otherPort, value);
							if (otherComp.info.ports[otherPort].global) {
								globalValues.set(otherPort, value);
							}
							// console.log(`Propagating value ${value} from ${comp.componentType}:${portName} to ${otherComp.componentType}:${otherPort}`);
							
						}

						if (otherComp && !visitedComponents.has(otherComp) && componentReady(otherComp) && !openComponents.includes(otherComp)) {
							openComponents.push(otherComp);
						}
					}
				}
			}

			if (this.cbComponentUpdate) {
				this.cbComponentUpdate(comp, data);
			}
		}

		const range = levelData.levels[this.currentLevel].range;
		const laserCo = new Point(
			inverseLerp(range[0], range[2], globalValues.get('X') ?? 0),
			inverseLerp(range[1], range[3], globalValues.get('Y') ?? 0),
		);
		this.onLaser.dispatch(laserCo);

		if (this.laserKillRemain > 0) {
			this.handleLaserKill(laserCo);
		}
	}

	handleLaserKill(laserCo: Point) {
		const CUTOFF_DISTANCE = 0.025;
		// find a triggie within range...
		for (const trig of this.triggies) {
			const dist = Point.length(laserCo.minus(trig));
			if (dist < CUTOFF_DISTANCE) {
				trig.hit();
				if (trig.hits === 2) {
					this.fragCounter++;
				}
			}
		}

		if (--this.laserKillRemain === 0) {
			this.handleLaserKillFinished();
		}
	}

	handleLaserKillFinished() {
		// decide if it was a win or a loss
		if (this.fragCounter < NUM_TRIGGIES) {
			// let all trigges return
			for (const trig of this.triggies) {
				trig.clear('return');
			}
		}
		else {
			// explode triggies.
			for (const trig of this.triggies) {
				trig.clear('explode');
			}
			this.onLevelComplete.dispatch(true);
		}
	}

	laserKillRemain = 0;
	fragCounter = 0;
	fireLaser() {
		if (this.laserKillRemain > 0) { return; } // laser already fired!
		this.fragCounter = 0;
		this.laserKillRemain = NUM_TRIGGIES * 2;
	}
	
	readonly onLevelComplete = new Signal<true>();

	cbCreateTriggie?: CBCreateTriggie;
	onCreateTriggie(cb : CBCreateTriggie) {
		this.cbCreateTriggie = cb;
		for (const triggie of this.triggies) {
			cb(triggie);
		}
	}
	
	initializeTriggies() {
		const func = levelData.levels[this.currentLevel].func;
		const ast = new Parser(func).parse();
		this.createTriggies(ast);
	}

	triggies: TriggieData[] = [];

	private createTriggies(ast: ASTNode) {
		const range = levelData.levels[this.currentLevel].range;
		for (let i = 0; i < NUM_TRIGGIES; i++) {
			const t = i / NUM_TRIGGIES;
			const result = evaluateScript(ast, { t });
			const x = inverseLerp(range[0], range[2], result.x);
			const y = inverseLerp(range[1], range[3], result.y);

			const triggie = new TriggieData(x, y);
			this.triggies.push(triggie);
			if (this.cbCreateTriggie) {
				this.cbCreateTriggie(triggie);
			}
		}
	}

	addComponent(comp: Component) {
		this.components.push(comp);
		if (this.cbComponentAdded) {
			this.cbComponentAdded(comp);
		}
	}

	addConnector(con: Connector) {
		this.connectors.push(con);
		if (this.cbConnectorAdded) {
			this.cbConnectorAdded(con);
		}
	}

	cbComponentAdded?: (comp: Component) => void;
	onComponentAdded(cb: (comp: Component) => void) {
		this.cbComponentAdded = cb;
		// immediately call callback with existing components.
		for (const comp of this.components) {
			cb(comp);
		}
	}

	cbConnectorAdded?: (con: Connector) => void;
	onConnectorAdded(cb: (con: Connector) => void) {
		this.cbConnectorAdded = cb;
		// immediately call callback with existing components.
		for (const con of this.connectors) {
			cb(con);
		}
	}

	cbComponentUpdate?: (comp: Component, data: Map<string, number>) => void;
	onComponentUpdate(cb: (comp: Component, data: Map<string, number>) => void) {
		this.cbComponentUpdate = cb;
	}

	readonly onLaser = new Signal<{x: number, y: number}>();
}