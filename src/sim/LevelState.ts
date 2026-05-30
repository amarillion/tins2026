import testSave from '../data/test-save.json';
import allLevels from '../data/levels.json';
import { ComponentInfo, getComponentInfo } from './ComponentInfo';
import { evaluateExpression, Parser } from '../util/parser';

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

	readonly currentLevel = 0; // Immutable - create a new state for next level.

	connectors: Connector[] = [];
	components: Component[] = [];

	levelInfo = allLevels.levels[3];

	loadFromSave(data: typeof testSave) {

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

		if (this.cbLaser) {
			this.cbLaser(globalValues);
		}

	}

	initializeTriggies(callback: (x: number, y: number) => void) {

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

	cbLaser?: (data: Map<string, number>) => void;
	onLaser(cb: (data: Map<string, number>) => void) {
		this.cbLaser = cb;
	}

}