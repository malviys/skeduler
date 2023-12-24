/**
 * Reduces array of functions into single result value
 *
 * @description
 * @type {F} -- Input function
 * @type {V} -- Input/Output value
 */
export function reduceFns<F extends (v: V) => V, V>(value: V, ...fns: F[]): V {
    return fns.reduce((ac, fn) => fn(ac), value);
}
