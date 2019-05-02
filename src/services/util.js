/**
 * Calculates total time in minutes.
 *
 * @param {Object} duration 
 * @param {String} duration.h hours
 * @param {String} duration.m minutes
 */
export const totalDuration = ({ h, m }) => _.parseInt(h) * 60 + _.parseInt(m);

/**
 * Calculates total cost after discount.
 * @param {String} cost 
 * @param {String} discount 
 */
export const totalCost = (cost, discount) => _.parseInt(cost) - (_.parseInt(discount) * 0.01 * _.parseInt(cost)).toFixed(2);
