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
	
	constructor(componentType: string) {
		this.info = getComponentInfo(componentType);
		this.componentType = componentType;
	}
}

class Connector {
	mx = 0;
	my = 0;
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

	cbComponentAdded?: (comp: Component) => void;

	onComponentAdded(cb: (comp: Component) => void) {
		this.cbComponentAdded = cb;
	}
}