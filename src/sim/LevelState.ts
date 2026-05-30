import testSave from '../data/test-save.json';
import allLevels from '../data/levels.json';
import { ComponentInfo, getComponentInfo } from './ComponentInfo';

export class Component {

	info: ComponentInfo;
	componentType: string;
	fixed = false; /* whether this can be deleted or not */
	mx = 0;
	my = 0;
	rotation = 0; /* 0-3 */

	connectorMap = new Map<string, Connector[]>();

	constructor(componentType: string) {
		this.info = getComponentInfo(componentType);
		this.componentType = componentType;
	}

	connect(portName: string, connector: Connector) {
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
					const portX = comp.mx + portInfo.dx;
					const portY = comp.my + portInfo.dy;
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
	}

	cbConnectorAdded?: (con: Connector) => void;
	onConnectorAdded(cb: (con: Connector) => void) {
		this.cbConnectorAdded = cb;
	}

}