import _ from 'lodash';

import { totalDuration, totalCost } from './util';
import { currency, deals } from '../assets/fares.json';

const groups = _.groupBy(deals, 'departure');
const shortTimeMap = {};
const shortTimeMapFull = {};
const minExpenseMap = {};
const minExpenseMapFull = {};

// Create weight graphs based on minimum duration and cost.
_.keys(groups).forEach(key => {
  shortTimeMap[key] = {};
  shortTimeMapFull[key] = {};
  minExpenseMap[key] = {};
  minExpenseMapFull[key] = {};
  groups[key].forEach(item => {
    if (shortTimeMap[key][item.arrival]) {
      if (totalDuration(item.duration) < shortTimeMap[key][item.arrival]) {
        shortTimeMap[key][item.arrival] = totalDuration(item.duration)
        shortTimeMapFull[key][item.arrival] = item;
      }
    } else {
      shortTimeMap[key][item.arrival] = totalDuration(item.duration)
      shortTimeMapFull[key][item.arrival] = item;
    }

    if (minExpenseMap[key][item.arrival]) {
      if (totalCost(item.cost, item.discount) < minExpenseMap[key][item.arrival]) {
        minExpenseMap[key][item.arrival] = totalCost(item.cost, item.discount)
        minExpenseMapFull[key][item.arrival] = item;
      }
    } else {
      minExpenseMap[key][item.arrival] = totalCost(item.cost, item.discount)
      minExpenseMapFull[key][item.arrival] = item;
    }
  })
})


/**
 * Return currency type.
 */
export const getCurrency = () => currency;

/**
 * Return list of valid locations.
 */
export const getLocations = () => _.keys(groups);

/**
 * 
 * @param {String} departure Departure location name
 * @param {String} arrival Arrival location name
 * @param {String} type Granularity type if time or money.
 */
export const getShortestPath = (departure, arrival, type) => {
  // Load graph type based on granularity.
  let graph;
  if (type === 'time') {
    graph = shortTimeMap;
  }
  if (type === 'money') {
    graph = minExpenseMap;
  }

  /**
   * Retrun selected path list with full deal details.
   *
   * @param {String[]} path List of location path to be taken.
   * @param {String} type Granularity type if time or money.
   */
  function _getFullPath(path, type) {
    let fullPath = [];
    if (path.length >= 2) {
      for (let i = 0; i < path.length - 1; i++) {
        if (type === 'time') {
          fullPath.push(shortTimeMapFull[path[i]][path[i+1]])
        }
        if (type === 'money') {
          fullPath.push(minExpenseMapFull[path[i]][path[i+1]])
        }
      }
    }
    return fullPath;
  }

  /**
   * Return the minimum node that has not been calculated.
   *
   * @param {Object} weights Object to keep track of weights.
   * @param {String[]} completed List of nodes that have been traversed and calculated.
   */
  const _minValueNode = (weights, completed) => {
    let min = null;
    _.keys(weights).forEach(node => {
      if (_.isNil(min) || weights[min] > weights[node]) {
        if (!_.includes(completed, node)) {
          min = node;
        }
      }
    });
    return min;
  };

  // Assign max weight to arrival initially.
  const weights = _.extend({arrival: Number.MAX_SAFE_INTEGER}, graph[departure]);

  // Parent of arrival not know, assign to null initally.
  const parents = {arrival: null};

  // Tracks list of nodes that has been traversed and calculated.
  const completedNodes = [];

  // Populated parents based on children.
  for (let child in graph[departure]) {
    parents[child] = departure;
  }

  // Find node that has not yet been processed and repeat procedure.
  let node = _minValueNode(weights, completedNodes);
  while (node) {
    let weight = weights[node];
    let children = graph[node];
    for (let n in children) {
      // Child node should not equal departure to avoid continous loop.
      if (departure !== n){
        // Update costs based on which is lower.
        let currentWeight = children[n] + weight;
        if (_.isNil(weights[n]) || (currentWeight < weights[n])) {
          weights[n] = currentWeight;
          parents[n] = node;
        }
      }
    }
    completedNodes.push(node);
    node = _minValueNode(weights, completedNodes);
  }

  const finalPath = [arrival];  
  let parent = parents[arrival];
  while (parent) {
    finalPath.unshift(parent);
    parent = parents[parent];
  }
  return _getFullPath(finalPath, type);
};