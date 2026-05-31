import { assert } from './assert.js';

export interface IPoint {
	x: number,
	y: number,
}

export class Point implements IPoint {

	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	
	// TODO: rename to turnCcw() to indicate that this is only right turns
	/**
	 * @param {*} degrees must be a multiple of 90. Positive: rotate left. Negative: rotate right
	 * returns a new Point()
	 */
	rotate(degrees: number) {
		return Point.rotate(this, degrees);
	}

	// TODO: rename to turnCcw() to indicate that this is only right turns
	static rotate(p: IPoint, degrees: number) {
		const { x, y } = p;
		switch ((degrees + 360) % 360) {
			case 270: return new Point(-y, x);
			case 180: return new Point(-x, -y);
			case 90: return new Point(y, -x);
			case 0: return new Point(x, y);
			default: assert(false, `Invalid value ${degrees}`);
		}
	}

	/** will later be renamed to mul */
	static times(a: IPoint, b: IPoint) {
		return new Point(a.x * b.x, a.y * b.y);
	}

	/** will later be renamed to mul */
	times(b: IPoint) {
		return Point.times(this, b);
	}

	/**
	Scale the vector by a scalar value
	returns a new Point
 	*/
	scale(val: number) {
		return Point.scale(this, val);
	}

	static scale(p: IPoint, val: number) {
		return new Point(p.x * val, p.y * val);
	}

	/**
		Scale the vector
		returns a new Point
		@deprecated use scale, so that we can free this up for multiplying by another point
 	*/
	mul(val: number) {
		return Point.mul(this, val);
	}

	/** @deprecated use scale */
	static mul(p: IPoint, val: number) {
		return new Point(p.x * val, p.y * val);
	}

	/**
	 * @param {*} p point to add to this
	 * returns a new Point containing the sum
	 */
	plus(p: IPoint) {
		return Point.plus(this, p);
	}

	static plus(a: IPoint, b: IPoint) {
		return new Point(a.x + b.x, a.y + b.y);
	}

	/* returns a new point, which you get after sustracting p from this */
	minus(p: IPoint) {
		return Point.minus(this, p);
	}

	static minus(a: IPoint, b: IPoint) {
		return new Point(a.x - b.x, a.y - b.y);
	}

	/**
	 * returns the manhattan distance from 0,0 to this point.
	 */
	manhattan() {
		return Point.manhattan(this);
	}

	static manhattan(p: IPoint) {
		return Math.abs(p.x) + Math.abs(p.y);
	}

	toString() {
		return Point.toString(this);
	}

	static toString(p: IPoint) {
		return `${p.x},${p.y}`;
	}

	equals(other: IPoint) {
		return Point.equals(this, other);
	}

	static equals(a: IPoint, b: IPoint) {
		return a.x === b.x && a.y === b.y;
	}

	static wrap(value: IPoint, area: IPoint) {
		const result = new Point(value.x, value.y);
		while (result.x < 0) { result.x += area.x; }
		result.x %= area.x;
		while (result.y < 0) { result.y += area.y; }
		result.y %= area.y;
		return result;
	}
	
	wrap(area: IPoint) {
		return Point.wrap(this, area);
	}

	static length(p: IPoint) {
		return Math.sqrt(p.x * p.x + p.y * p.y);
	}

	length() {
		return Point.length(this);
	}

	// TODO: possible alternative name: inside
	/**
	 * returns true if the other point is larger than 0,0 and smaller than this point.
	 * If the current points coordinates are negative, this will always return false.
	 */
	static contains(self: IPoint, other: IPoint) {
		return (other.x >= 0 && other.y >= 0 && other.x < self.x && other.y < self.y);
	}

	contains(other: IPoint) {
		return Point.contains(this, other);
	}

	floor() {
		return new Point(Math.floor(this.x), Math.floor(this.y));
	}
}
