import Phaser from 'phaser';

export type ButtonStyle = Phaser.Types.GameObjects.Text.TextStyle & { fill?: string | CanvasGradient | CanvasPattern };

const BASE_BUTTON_STYLE = {
	fontSize: '9px',
	padding: { x: 4, y: 2 },
	align: "center",
	backgroundColor: '#444444',
	fill: '#FFFFFF',
};

const HOVER_STYLE = {
	fill: '#f39c12',
};

const TOGGLED_STYLE = {
	fill: '#ffff00',
	backgroundColor: '#666666',
};

export class Button {
	constructor(x: number, y: number, w: number, h: number, label: string, scene: Phaser.Scene,
		config: { callback?: () => void, style?: ButtonStyle },
	) {
		const button = scene.add.text(x, y, label);
		const normalStyle = {
			...BASE_BUTTON_STYLE,
			...config.style,
			fixedWidth: w,
			fixedHeight: h,
		};
		const hoverStyle = {
			...normalStyle,
			...HOVER_STYLE,
		};
		const downStyle = {
			...normalStyle,
			...HOVER_STYLE,
			...TOGGLED_STYLE,
		};
		button
			.setOrigin(0)
			.setStyle(normalStyle)
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', () => { button.setStyle(downStyle); if (config.callback) { config.callback(); } })
			.on('pointerup', () => button.setStyle(hoverStyle))
			.on('pointerover', () => button.setStyle(hoverStyle))
			.on('pointerout', () => button.setStyle(normalStyle));
	}
}

type ToggleCallback = ( newValue: boolean, source: ToggleButton ) => void;

// Initial version of ToggleButton and ToggleButtonGroup generated with DeepSeek
export class ToggleButton {
	
	scene: Phaser.Scene;
	x: number;
	y: number;

	text: string;
	isToggled: boolean;
	group: ToggleButtonGroup | null;
	onToggleCallback: ToggleCallback | null;
	normalStyle: ButtonStyle;
	toggledStyle: ButtonStyle;
	textObject: Phaser.GameObjects.Text;
	originalFill: string | CanvasGradient | CanvasPattern;

	/**
	 * Creates a new Toggle Button
	 * @param {Phaser.Scene} scene - The Phaser scene
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @param {string} text - Button text
	 * @param {Object} config - Configuration options
	 * @param {boolean} config.isToggled - Initial toggled state (default: false)
	 * @param {Array} config.group - Button group for mutual exclusivity (optional)
	 * @param {Object} config.style - Text style for normal state
	 * @param {Object} config.toggledStyle - Text style for toggled state
	 * @param {Function} config.onToggle - Callback when toggled state changes
	 */
	constructor(
		scene: Phaser.Scene, x: number, y: number, w: number, h: number, text: string,
		config: {
			isToggled?: boolean,
			group?: ToggleButtonGroup,
			style?: Phaser.Types.GameObjects.Text.TextStyle,
			toggledStyle?: Phaser.Types.GameObjects.Text.TextStyle,
			onToggle?: ToggleCallback,
		} = {},
	) {
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.text = text;
		this.isToggled = config.isToggled || false;
		this.group = config.group || null;
		this.onToggleCallback = config.onToggle || null;
		
		// Default styles
		this.normalStyle = {
			...BASE_BUTTON_STYLE,
			fixedWidth: w,
			fixedHeight: h,
			...config.style,
		};
		
		this.toggledStyle = {
			...this.normalStyle,
			...TOGGLED_STYLE,
			...config.toggledStyle,
		};
		
		// Create the text object
		this.textObject = scene.add.text(x, y, text, this.isToggled ? this.toggledStyle : this.normalStyle);
		this.textObject.setOrigin(0);
		this.textObject.setInteractive({ useHandCursor: true });
		
		// Add event listeners
		this.textObject.on('pointerdown', this.handlePointerDown, this);
		this.textObject.on('pointerover', this.handlePointerOver, this);
		this.textObject.on('pointerout', this.handlePointerOut, this);
		
		// Add to group if provided
		if (this.group) {
			this.group.add(this);
			// If this button is toggled initially, untoggle others in the group
			if (this.isToggled) {
				this.untoggleGroupExcept(this);
			}
		}
		
		// Store original style for hover effects
		this.originalFill = this.textObject.style.color;
	}
	
	/**
	 * Handle pointer down event
	 */
	handlePointerDown() {
		this.toggle();
	}
	
	/**
	 * Handle pointer over event
	 */
	handlePointerOver() {
		this.textObject.setStyle(HOVER_STYLE);
	}
	
	/**
	 * Handle pointer out event
	 */
	handlePointerOut() {
		// Restore to current state's color
		const currentStyle = this.isToggled ? this.toggledStyle : this.normalStyle;
		this.textObject.setStyle({ fill: currentStyle.fill });
	}
	
	/**
	 * Toggle the button state
	 * @param {boolean} skipCallback - Skip calling the callback
	 */
	toggle(skipCallback = false) {
		if (this.group && !this.isToggled) {
			// Untoggle all other buttons in the group first
			this.untoggleGroupExcept(this);
		}
		
		this.isToggled = !this.isToggled;
		
		// Update visual style
		this.updateStyle();
		
		// Call the callback if provided and not skipped
		if (!skipCallback && this.onToggleCallback) {
			this.onToggleCallback(this.isToggled, this);
		}
	}
	
	/**
	 * Set the button to toggled state
	 * @param {boolean} skipCallback - Skip calling the callback
	 */
	setToggled(skipCallback = false) {
		if (this.isToggled) return;
		
		if (this.group) {
			this.untoggleGroupExcept(this);
		}
		
		this.isToggled = true;
		this.updateStyle();
		
		if (!skipCallback && this.onToggleCallback) {
			this.onToggleCallback(this.isToggled, this);
		}
	}
	
	/**
	 * Set the button to untoggled state
	 * @param {boolean} skipCallback - Skip calling the callback
	 */
	setUntoggled(skipCallback = false) {
		if (!this.isToggled) return;
		
		this.isToggled = false;
		this.updateStyle();
		
		if (!skipCallback && this.onToggleCallback) {
			this.onToggleCallback(this.isToggled, this);
		}
	}
	
	/**
	 * Untoggle all buttons in the group except the specified one
	 * @param {ToggleButton} exceptButton - Button to exclude from untoggling
	 */
	untoggleGroupExcept(exceptButton: ToggleButton) {
		if (!this.group) return;
		
		this.group.getChildren().forEach((button: ToggleButton) => {
			if (button !== exceptButton && button.isToggled) {
				button.setUntoggled(true);
			}
		});
	}
	
	/**
	 * Update the text style based on current state
	 */
	updateStyle() {
		const style = this.isToggled ? this.toggledStyle : this.normalStyle;
		this.textObject.setStyle(style);
	}
	
	/**
	 * Change the button text
	 * @param {string} newText - New text to display
	 */
	setText(newText: string) {
		this.text = newText;
		this.textObject.setText(newText);
	}
	
	/**
	 * Get the current text
	 * @returns {string}
	 */
	getText() {
		return this.text;
	}
	
	/**
	 * Get the toggled state
	 * @returns {boolean}
	 */
	getToggled() {
		return this.isToggled;
	}
	
	/**
	 * Set new position
	 * @param {number} x - New X position
	 * @param {number} y - New Y position
	 */
	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.textObject.setPosition(x, y);
	}
	
	/**
	 * Enable or disable the button
	 * @param {boolean} enabled - Whether the button should be enabled
	 */
	setEnabled(enabled: boolean) {
		if (enabled) {
			this.textObject.setInteractive();
			this.textObject.setStyle({ alpha: 1 });
		} else {
			this.textObject.disableInteractive();
			this.textObject.setStyle({ alpha: 0.5 });
		}
	}
	
	/**
	 * Destroy the button and clean up
	 */
	destroy() {
		// Remove from group if exists
		if (this.group) {
			this.group.remove(this);
		}
		
		// Remove event listeners
		this.textObject.off('pointerdown', this.handlePointerDown, this);
		this.textObject.off('pointerover', this.handlePointerOver, this);
		this.textObject.off('pointerout', this.handlePointerOut, this);
		
		// Destroy the text object
		this.textObject.destroy();
	}
}

// Button Group Manager for easier group handling
export class ToggleButtonGroup {

	buttons: ToggleButton[] = [];
	
	/**
	 * Add a button to the group
	 * @param {ToggleButton} button - Button to add
	 */
	add(button: ToggleButton) {
		this.buttons.push(button);
		button.group = this;
	}
	
	/**
	 * Remove a button from the group
	 * @param {ToggleButton} button - Button to remove
	 */
	remove(button: ToggleButton) {
		const index = this.buttons.indexOf(button);
		if (index > -1) {
			this.buttons.splice(index, 1);
			button.group = null;
		}
	}
	
	/**
	 * Get all buttons in the group
	 * @returns {Array}
	 */
	getChildren() {
		return this.buttons;
	}
	
	/**
	 * Get the currently toggled button (returns first found)
	 * @returns {ToggleButton|null}
	 */
	getToggledButton() {
		return this.buttons.find(button => button.isToggled) || null;
	}
	
	/**
	 * Get all toggled buttons (for non-exclusive groups)
	 * @returns {Array}
	 */
	getToggledButtons() {
		return this.buttons.filter(button => button.isToggled);
	}
	
	/**
	 * Clear all buttons (destroy them)
	 */
	clear() {
		this.buttons.forEach(button => button.destroy());
		this.buttons = [];
	}
	
	/**
	 * Set all buttons to untoggled state
	 */
	clearAllToggled() {
		this.buttons.forEach(button => {
			if (button.isToggled) {
				button.setUntoggled(true);
			}
		});
	}
}
