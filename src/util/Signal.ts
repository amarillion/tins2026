import { assert } from './assert.js';

// for debugging, to check if all listeners are unsubsribed properly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let subscriptionCount = 0;

type ListenerFunc<E> = (event: E) => void;
type BindingType<E> = {
	listener: ListenerFunc<E>,
	context: unknown,
	isOnce: boolean,
};

/*
	mimicking signature of Phaser.Signal.
	but a lot simpler.
*/
export class Signal<E> {

	_listeners: BindingType<E>[];

	constructor() {
		this._listeners = [];
	}

	/**
	 * context can be used to remember 'this'
	 * @param {*} listener A function reference
	 * @param {*} context The context in which the function is run, i.e. what should be this.
	 * @returns a function that you may call to remove the listener again.
	 */
	add(listener : ListenerFunc<E>, context : unknown = null) {
		assert (typeof(listener) === "function");
		// TODO - it would be useful to use weak references here,
		// since forgetting to unregister a listener would be a memory leak
		const binding = { listener, context, isOnce: false };
		subscriptionCount++;
		this._listeners.push(binding);
		return () => this.remove(binding);
	}

	/** Listener will fire once and then remove itself. Useful for e.g. onFinished or onTimeOut events */
	addOnce(listener : ListenerFunc<E>, context : unknown = null) {
		const binding = { listener, context, isOnce: true };
		this._listeners.push(binding);
		return () => this.remove(binding);
	}

	remove(binding : BindingType<E>) {
		const idx = this._listeners.indexOf(binding);
		assert(idx >= 0, "Trying to remove listener that is not in the list");
		if (idx >= 0) { this._listeners.splice(idx, 1); }
		subscriptionCount--;
	}

	removeAll() {
		subscriptionCount -= this._listeners.length;
		this._listeners = [];
	}

	dispatch(event : E) {
		for (const binding of this._listeners) {
			binding.listener.apply(binding.context, [ event ]);
			if (binding.isOnce) {
				this.remove(binding);
			}
		}
	}
}
