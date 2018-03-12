//Redux stuff
//Ask Yeng if you have questions!

import {
  SET_PUBLIC_KEY,
  SET_PRIVATE_KEY,
  CHANGE_KEYS,
  SET_AUTH,
  START_CAPTURE,
  SET_CAPTURE_COUNT,
  STOP_CAPTURE,
  SET_REPLAY,
  START_NEW_REPLAY,
  STOP_REPLAY,
  SET_DATA_POINTS_FOR_GRAPH,
  SET_METRIC_FOR_GRAPH,
  SET_BOOLEANS_FOR_GRAPH,
  SET_ANALYTICS_FOR_GRAPH,
  SET_CAPTURE_NAME_FOR_GRAPH,
  SET_TOTAL_NAMES_FOR_GRAPH,
  CHANGE_STATE_FOR_COMPONENTS,
  SET_GRAPH_DATA_FROM_REPLAY
} from '../actions/constants'

import alasql from 'alasql';

let initialState = {
  name: '',
  privateKey: '',
  publicKey: '',
  error: '',
  loggedIn: false,
  activeCaptures: 0,
  activeReplays: 0,
  capture: 'Capture Inactive',
  replay: 'Replay Inactive',
  dataPointsForGraph: false,
  valuesForGraph: false,
  metricForGraph: false,
  numLinesForGraph: 0,
  booleansForGraph: false,
  replayCaptureNamesForGraph: false,
  analyticsForGraph: false,
  totalNames: false,
  currentCaptureForGraph: 'Capture Options',
  stateType: 'onCapture'
}

function reducer(state = initialState, action) {
  switch (action.type) {

    case CHANGE_STATE_FOR_COMPONENTS:
       return Object.assign({}, state, {
        stateType: action.key
       })

    case SET_BOOLEANS_FOR_GRAPH:
      return Object.assign({}, state, {
        booleansForGraph: action.key
      })

    case SET_DATA_POINTS_FOR_GRAPH:
    //leave this comment for now in case we end up putting the data points creation back into the redux state
      // let dataPoints = getAssignments(action.booleanArray, action.totalNameArray, action.metric, action.analytics, action.dataPoints, action.captureName);
      return Object.assign({}, state, {
        dataPointsForGraph: action.key,

      })

    case SET_PUBLIC_KEY:
      return Object.assign({}, state, {
        publicKey: action.key
      })

    case SET_PRIVATE_KEY:
      return Object.assign({}, state, {
        privateKey: action.key
      })

    case SET_AUTH:
      return Object.assign({}, state, {
        loggedIn: !state.loggedIn
      })
    case CHANGE_KEYS:
      return Object.assign({}, state, {
        formState: action.formState
      })

    case START_CAPTURE:
      return Object.assign({}, state, {
        activeCaptures: state.activeCaptures + 1,
        capture: 'Capture Active'
      })

    case SET_CAPTURE_COUNT:
      return Object.assign({}, state, {
        activeCaptures: action.count
      })

    case STOP_CAPTURE:
      return Object.assign({}, state, {
        activeCaptures: state.activeCaptures - 1,
        capture: 'Capture Inactive'
      })

    /*case SET_REPLAY:
      return Object.assign({}, state, {
        replayActive: !state.replayActive,
        replay: 'Replay Active'
      })*/

    case START_NEW_REPLAY:
      return Object.assign({}, state, {
        activeReplays: state.activeReplays + 1,
        replay: 'New Replay Started'
      })

    case STOP_REPLAY:
      return Object.assign({}, state, {
        activeReplays: state.activeReplays - 1,
        replay: 'Replay stopped'
      })

    case SET_METRIC_FOR_GRAPH:
      return Object.assign({}, state, {
        metricForGraph: action.key
      })

    case SET_ANALYTICS_FOR_GRAPH:
      return Object.assign({}, state, {
        analyticsForGraph: action.key
      })

    case SET_TOTAL_NAMES_FOR_GRAPH:
    let arrayOfFalses = [];
    let falsesLength = Object.keys(action.key).length;
    for(let i = 0; i < falsesLength; i++) {
      arrayOfFalses.push(false);
    }
    return Object.assign({}, state, {
      totalNames: action.key,
      booleansForGraph: arrayOfFalses
    })

    case SET_CAPTURE_NAME_FOR_GRAPH:
      return Object.assign({}, state, {
        currentCaptureForGraph: action.key
      })

    case SET_GRAPH_DATA_FROM_REPLAY:
    console.log('DISPATCHING THIS ACTION: ', action)
      return Object.assign({}, state, {
        booleansForGraph: action.booleans,
        currentCaptureForGraph: action.captureName,
        metricForGraph: action.metricName,
        stateType: action.stateName,
        totalNames: action.totNames
      })

    default:
      return state
  }
}

export default reducer
