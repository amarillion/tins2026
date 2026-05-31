import { assert } from './assert.js';

/**
 * Pick a random number between `0` (inclusive) and `n` (exclusive).
 * In other words, pick a non-negative number below `n`.
 */
export const randomInt = (n: number, prng = Math.random) => Math.floor(prng() * n);

/**
 * Randomly pick one item from an array of items.
 */
export const pickOne = <T>(array: T[], prng = Math.random) => array[randomInt(array.length, prng)];

// range: start inclusive, end exclusive
export const randomIntBetween = (a: number, b: number, prng = Math.random) => randomInt(b - a, prng) + a;

/**
 * Random number generator using a power law distribution.
 * Generates numbers between 0 and 1, with numbers close to 0 more likely.
 *
 * @param {number} gamma
 * @return {number}
 */
export const randomSkewed = (gamma = 0.6, prng = Math.random) => 1 - Math.pow(prng(), gamma);

/**
 * Random number generator using a power law distribution.
 * Generates numbers between 0 and n, with numbers close to 0 more likely.
 */
export const randomIntSkewed = (n: number, gamma = 0.6, prng = Math.random) => Math.floor(randomSkewed(gamma, prng) * n);

/**
 * Pick one item from the array, with the lower items more likely.
 */
export const pickOneSkewed = <T>(array: T[], gamma = 0.6, prng = Math.random) => array[randomIntSkewed(array.length, gamma, prng)];

/**
 * Pick between `min` and `max` random elements from the array. Elements are guaranteed
 * to be distinct.
 */
export const pickSome = <T>(array: T[], min = 1, max = 4, prng = Math.random) => {
	assert(min <= max);
	assert(max <= array.length);

	const num = randomIntSkewed(max - min, 0.4, prng) + min; // Random number, min more likely than max.
	const indices = new Set<number>();
	
	for (let i = 0; i < num || indices.size < min; ++i) {
		const index = randomInt(array.length, prng);
		indices.add(index);
	}

	return [ ...indices ].map(index => array[index]);
};

/**
Knuth-Fisher-Yates shuffle algorithm.

Array is shuffled in-place.
Reference to array is returned.
*/
export function shuffle<T>(array: T[], prng = Math.random) {
	const len = array.length;
	for (let i = len - 1; i > 0; i--) {
		const n = randomInt(i + 1, prng);
		
		[ array[n], array[i] ] = [ array[i], array[n] ];
	}
	return array;
}

export function randomBytes(num: number, prng = Math.random) {
	const data = new Int8Array(num);
	for (let i = 0; i < num; ++i) {
		data[i] = randomInt(256, prng);
	}
	return data;
}

/**
 * Convenience function that returns all functions bound to to a specific rng.
 */
export function randomize(prng = Math.random) {
	return {
		random: () => prng(),
		randomBytes: (n: number) => randomBytes(n, prng),
		shuffle: <T>(array: T[]) => shuffle(array, prng),
		randomInt: (n: number) => randomInt(n, prng),
		randomIntBetween: (a: number, b: number) => randomIntBetween(a, b, prng),
		pickOne: <T>(array: T[]) => pickOne(array, prng),
		pickSome: <T>(array: T[], min = 1, max = 4) => pickSome(array, min, max, prng),
		// TODO other functions
	};
}
