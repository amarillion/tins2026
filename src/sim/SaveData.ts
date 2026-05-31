import { z } from "zod";
import saveData from '../data/test-save-lev0.json';

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

export function getQuickSaveData(): SaveData {
	return parseSaveData(saveData);
}