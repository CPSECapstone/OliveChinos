//Redux stuff
//Ask Yeng if you have questions!

import {
  SET_PUBLIC_KEY,
  SET_PRIVATE_KEY,
  CHANGE_KEYS,
  SET_AUTH,
  START_CAPTURE,
  SET_CAPTURE_COUNT,
  SET_REPLAY_COUNT,
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
  SET_GRAPH_DATA_FROM_REPLAY,
  SET_SELECTED_REPLAY,
  START_REPLAY_FROM_CAPTURE,
  CLOSE_REPLAY_MODAL,
  SET_CAPTURE_ACTIVE_LIST,
  SET_CAPTURE_COMPLETED_LIST,
  SET_CAPTURE_SCHEDULED_LIST,
  SET_REPLAY_ACTIVE_LIST,
  SET_REPLAY_COMPLETED_LIST,
  SET_DATABASE_INSTANCES,
  SET_IS_CAPTURES_LOADED,
  SET_IS_REPLAYS_LOADED,
  SET_CAPTURES_TO_REPLAY,
  SET_CAPTURE_TO_REPLAY,
  SET_LOADER_DISPLAY,
  SET_DISPLAY_CAPTURE_TRANSACTIONS_MODAL,
  SET_CAPTURE_TRANSACTIONS
} from '../actions/constants'

import alasql from 'alasql';
import jquery from 'jquery'


let initialState = {
  name: '',
  privateKey: '',
  publicKey: '',
  error: '',
  loggedIn: false,
  activeCapturesNum: 0,
  activeReplaysNum: 0,
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
  stateType: 'onCapture',
  selectedReplay: false,
  showReplayModal: false,
  capturesActive: false,
  capturesScheduled: false,
  capturesCompleted: false,
  replaysActive: false,
  replaysCompleted: false,
  capturesToReplay: false,
  databaseInstances: [],
  isCapturesLoaded: false,
  isReplaysLoaded: false,
  captureToReplay: false,
  displayLoader: false,
  showCaptureTransactions: false,
  captureTransactions: {transactions: []}
}

function apiRequest(url, action = "list_scheduled") {
  return jquery.ajax({
    url: window.location.href + 'capture/' + action,
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json'
  }).done(function (data) {
    console.log("REDUCER API REQUEST: ", data)
  })
}

function reducer(state = initialState, action) {
  switch (action.type) {

    case CHANGE_STATE_FOR_COMPONENTS:
      if(action.key == 'onAnalyze') {
        return Object.assign({}, state, {
          stateType: action.key,
          totalNames : false,
          currentCaptureForGraph: 'Capture Options',
          selectedReplay: false,
          dataPointsForGraph: false,
          valuesForGraph: false,
          metricForGraph: false,
          numLinesForGraph: 0,
          booleansForGraph: false,
          replayCaptureNamesForGraph: false,
        })
      } else {
          return Object.assign({}, state, {
            stateType: action.key
          })
      }
      

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
        activeCapturesNum: state.activeCapturesNum + 1,
        capture: 'Capture Active'
      })

    case SET_CAPTURE_COUNT:
      return Object.assign({}, state, {
        activeCapturesNum: action.count
      })

    case SET_REPLAY_COUNT:
      return Object.assign({}, state, {
        activeReplaysNum: action.count
      })

    case STOP_CAPTURE:
      return Object.assign({}, state, {
        activeCapturesNum: state.activeCapturesNum - 1,
        capture: 'Capture Inactive'
      })

    /*case SET_REPLAY:
      return Object.assign({}, state, {
        replayActive: !state.replayActive,
        replay: 'Replay Active'
      })*/

    case START_NEW_REPLAY:
      return Object.assign({}, state, {
        activeReplaysNum: state.activeReplaysNum + 1,
        replay: 'New Replay Started'
      })

    case STOP_REPLAY:
      return Object.assign({}, state, {
        activeReplaysNum: state.activeReplaysNum - 1,
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
      for (let i = 0; i < falsesLength; i++) {
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
      return Object.assign({}, state, {
        booleansForGraph: action.booleans,
        currentCaptureForGraph: action.captureName,
        metricForGraph: action.metricName,
        stateType: action.stateName,
        totalNames: action.totNames,
        selectedReplay: action.selectedReplay
      })

    case SET_SELECTED_REPLAY:
      return Object.assign({}, state, {
        selectedReplay: action.key
      })

    case START_REPLAY_FROM_CAPTURE:

      return Object.assign({}, state, {
        showReplayModal: true
      })

    case CLOSE_REPLAY_MODAL:
      return Object.assign({}, state, {
        showReplayModal: false
      })

    case SET_CAPTURE_ACTIVE_LIST:
      return Object.assign({}, state, {
        capturesActive: action.key
      })

    case SET_CAPTURE_SCHEDULED_LIST:
      return Object.assign({}, state, {
        capturesScheduled: action.key
      })

    case SET_CAPTURE_COMPLETED_LIST:
      return Object.assign({}, state, {
        capturesCompleted: action.key
      })

    case SET_REPLAY_ACTIVE_LIST:
      return Object.assign({}, state, {
        replaysActive: action.key
      })

    case SET_REPLAY_COMPLETED_LIST:
      return Object.assign({}, state, {
        replaysCompleted: action.key
      })

    case SET_DATABASE_INSTANCES:
      return Object.assign({}, state, {
        databaseInstances: action.key
      })

    case SET_IS_CAPTURES_LOADED:
      return Object.assign({}, state, {
        isCapturesLoaded: action.key
      })

    case SET_IS_REPLAYS_LOADED:
      return Object.assign({}, state, {
        isReplaysLoaded: action.key
      })

    case SET_CAPTURES_TO_REPLAY:
      return Object.assign({}, state, {
        capturesToReplay: action.key
      })

    case SET_CAPTURE_TO_REPLAY:
      return Object.assign({}, state, {
        captureToReplay: action.key
      })

    case SET_LOADER_DISPLAY:
      return Object.assign({}, state, {
        displayLoader: action.key
      })

    case SET_DISPLAY_CAPTURE_TRANSACTIONS_MODAL:
      return Object.assign({}, state, {
        showCaptureTransactions: action.key
      })

    case SET_CAPTURE_TRANSACTIONS:
      return Object.assign({}, state, {
        captureTransactions: action.key
      })

    default:
      return state
  }
}

export default reducer
