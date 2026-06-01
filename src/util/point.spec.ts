import { describe, it, expect } from 'vitest';
import { Point, shortestDistanceToSegment } from './point';

describe('Point', () => {
	it('should calculate distance to another point', () => {
		const p1 = new Point(0, 0);
		const p2 = new Point(3, 4);
		expect(p1.distanceTo(p2)).toBe(5);
	});

	it('should calculate shortest distance to a line segment', () => {
		// Usage example:
		const point = new Point(3, 4);
		const segmentStart = new Point(0, 0);
		const segmentEnd = new Point(5, 0);

		const distance = shortestDistanceToSegment(point, segmentStart, segmentEnd);
		expect(distance).toBe(4);
	});
});