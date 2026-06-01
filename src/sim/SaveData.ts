import { z } from "zod";
import saveData from '../data/test-save-lev7.json';

// Base component schema
const ComponentSchema = z.object({
	type: z.string(),
	data: z.object({
		value: z.number(),
	}).optional(),
	x: z.number(),
	y: z.number(),
	rotation: z.number(),
	fixed: z.boolean().optional(),
});

// Connector schema
const ConnectorSchema = z.object({
	from: z.tuple([ z.number(), z.number() ]),
	to: z.tuple([ z.number(), z.number() ]),
});

// Main save data schema
const SaveDataSchema = z.object({
	saveData: z.object({
		currentLevel: z.number(),
		components: z.array(ComponentSchema),
		connectors: z.array(ConnectorSchema),
	}),
});

// Type inference
export type SaveData = z.infer<typeof SaveDataSchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type Connector = z.infer<typeof ConnectorSchema>;


// Function to parse and validate the data
function parseSaveData(jsonData: unknown): SaveData {
	const result = SaveDataSchema.parse(jsonData);
	return result;
}

export function hasValidSaveData(): boolean {
	const sessionSaveData = localStorage.getItem("tins-quick-save") ?? '';
	try {
		parseSaveData(JSON.parse(sessionSaveData));
		return true;
	} catch (_error) {
		return false;
	}
}

export function getQuickSaveData(): SaveData {
	// return parseSaveData(saveData);
	return parseSaveData(JSON.parse(localStorage.getItem("tins-quick-save") ?? ''));
}

export function saveGameData(data: SaveData) {
	// save to local storage
	localStorage.setItem("tins-quick-save", JSON.stringify(data));
}