//Redux stuff
//Ask Yeng if you have questions!

import {
  SET_PUBLIC_KEY,
  SET_PRIVATE_KEY,
  CHANGE_KEYS,
  SET_AUTH,
  START_CAPTURE,
  STOP_CAPTURE,
  SET_REPLAY,
  START_NEW_REPLAY,
  STOP_REPLAY,
  SET_DATA_POINTS_FOR_GRAPH,
  SET_VALUES_FOR_GRAPH,
  SET_METRIC_FOR_GRAPH,
  SET_NUM_LINES_FOR_GRAPH,
  SET_BOOLEANS_FOR_GRAPH,
  SET_REPLAY_CAPTURE_NAMES_FOR_GRAPH,
  SET_ANALYTICS_FOR_GRAPH,
<<<<<<< HEAD
  SET_PREVIOUS_METRC
=======
  SET_CAPTURE_NAME_FOR_GRAPH
>>>>>>> 2e1fd130dac83b710d849f2eeeb3dcefa17330a9
} from './constants'

export function setReplayCaptureNamesForGraph(key) {
  return { type: SET_REPLAY_CAPTURE_NAMES_FOR_GRAPH, key }
}
<<<<<<< HEAD

export function setPreviousMetric(key) {
  return { type: SET_PREVIOUS_METRC, key }
}

export function setBooleansForGraph(
  booleans,
  totalNames,
  metric1,
  numLines1,
  analytics1,
  dataPoints1,
  uniqueName1
) {
  return {
    type: SET_BOOLEANS_FOR_GRAPH,
    booleanArray: booleans,
    totalNameArray: totalNames,
    metric: metric1,
    numLines: numLines1,
    analytics: analytics1,
    dataPoints: dataPoints1,
    uniqueName: uniqueName1
  }
=======
export function setBooleansForGraph(booleans, totalNames, metric1, numLines1, analytics1, dataPoints1, uniqueName1, captureName1) {
  return {type: SET_BOOLEANS_FOR_GRAPH, booleanArray: booleans, totalNameArray: totalNames, metric: metric1, numLines: numLines1, analytics: analytics1, dataPoints: dataPoints1, uniqueName: uniqueName1, captureName: captureName1}
>>>>>>> 2e1fd130dac83b710d849f2eeeb3dcefa17330a9
}
export function setNumLinesForGraph(key) {
  return { type: SET_NUM_LINES_FOR_GRAPH, key }
}
export function setPublicKey(key) {
  return { type: SET_PUBLIC_KEY, key }
}

export function setPrivateKey(key) {
  return { type: SET_PRIVATE_KEY, key }
}

export function changeKeys(formState) {
  return { type: CHANGE_KEYS, formState }
}

export function setAuth() {
  return { type: SET_AUTH }
}

export function startCapture() {
  return { type: START_CAPTURE }
}

export function stopCapture() {
  return { type: STOP_CAPTURE }
}
export function setReplay() {
  return { type: SET_REPLAY }
}

export function startNewReplay() {
  return { type: START_NEW_REPLAY }
}

export function stopReplay() {
  return { type: STOP_REPLAY }
}

export function setDataPointsForGraph(key) {
  return { type: SET_DATA_POINTS_FOR_GRAPH, key }
}

export function setValuesForGraph(key) {
  return { type: SET_VALUES_FOR_GRAPH, key }
}

export function setMetricForGraph(key) {
  return { type: SET_METRIC_FOR_GRAPH, key }
}

export function setAnalyticsForGraph(key) {
<<<<<<< HEAD
  return { type: SET_ANALYTICS_FOR_GRAPH, key }
}
=======
  return {type: SET_ANALYTICS_FOR_GRAPH, key}
}

export function setCaptureNameForGraph(key) {
  return {type: SET_CAPTURE_NAME_FOR_GRAPH, key}
}
>>>>>>> 2e1fd130dac83b710d849f2eeeb3dcefa17330a9
