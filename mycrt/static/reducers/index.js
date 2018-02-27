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
  SET_VALUES_FOR_GRAPH,
  SET_METRIC_FOR_GRAPH,
  SET_NUM_LINES_FOR_GRAPH,
  SET_BOOLEANS_FOR_GRAPH,
  SET_REPLAY_CAPTURE_NAMES_FOR_GRAPH,
  SET_ANALYTICS_FOR_GRAPH,
  SET_CAPTURE_NAME_FOR_GRAPH,
  SET_TOTAL_NAMES_FOR_GRAPH,
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
  currentCaptureForGraph: 'Capture Options'

}

//function that is called from the graph component, it passes in all of the currently selected
//values and then creates the data JSON to be graphed and stores it in the dataPointsForGraph redux state
function getAssignments(booleanArray, totalNames, metric, analytics, dataPoints, captureName) {
    let newLinesToGraph = []
    let arrayOfDataJSONS = dataPoints;
    for (let i = 0; i < booleanArray.length; i++) {
      if (booleanArray[i]) {
        newLinesToGraph.push(totalNames[i])
      }
    }
    let numberOfSelectedReplays = newLinesToGraph.length
    if (analytics != false) {
      let totalNumberOfOptionsToChooseFrom = totalNames.length
      if ((numberOfSelectedReplays <= totalNumberOfOptionsToChooseFrom) && (numberOfSelectedReplays > 0)) {
        let uniqueName = newLinesToGraph[0]
        let firstJSON = getSpecifiedMetricData(booleanArray, totalNames, metric, newLinesToGraph.length, analytics, dataPoints, uniqueName, captureName)
        arrayOfDataJSONS = [numberOfSelectedReplays]
        arrayOfDataJSONS[0] = firstJSON
        for(let i = 1; i < numberOfSelectedReplays; i++) {
          uniqueName = newLinesToGraph[i]
          arrayOfDataJSONS[i] = getSpecifiedMetricData(booleanArray, totalNames, metric, newLinesToGraph.length, analytics, arrayOfDataJSONS[i - 1], uniqueName, captureName)
        }
      }
    }
  if(arrayOfDataJSONS == undefined || arrayOfDataJSONS == false) {
    return false;
  }
  else {
    return arrayOfDataJSONS[arrayOfDataJSONS.length - 1];
  }
}

function getSpecifiedMetricData(booleanArray, totalNames, metric, numLines, analytics, dataPoints, uniqueName, captureName) {
  let currMetric = metric;
  let listOfAnalytics = analytics[captureName];
  if (booleanArray != false && currMetric != false) {
    for (let outer = 0; outer < booleanArray.length; outer++) {
      let pointsValues = []
      if (booleanArray[outer]) {
        let currIndex = `${uniqueName}`
        for (let i = 0; i < listOfAnalytics[currIndex][currMetric].length; i++) {
          let currPoint = { seconds: `${i}` }
          currPoint[uniqueName] = listOfAnalytics[currIndex][currMetric][i].Average
          pointsValues.push(currPoint)
        }
        if(dataPoints != false && dataPoints != undefined ) {
          return updateFinalJSONObject(pointsValues, numLines, dataPoints, captureName)
        }
        else {
          return pointsValues
        }
      }
    }
  }
}

function updateFinalJSONObject(newJsonElement, numLines, dataPoints, captureName) {
  if (numLines > 0) {
    let oldJsonElement = dataPoints;
    alasql.fn.extend = alasql.utils.extend;
    var res = alasql('SELECT * FROM ? newJsonElement JOIN ? oldJsonElement USING seconds', [newJsonElement, oldJsonElement]);
    return res
  }
  else
    return newJsonElement
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_BOOLEANS_FOR_GRAPH:
      return Object.assign({}, state, {
        booleansForGraph: action.key
      })

    case SET_DATA_POINTS_FOR_GRAPH:
      let dataPoints = getAssignments(action.booleanArray, action.totalNameArray, action.metric, action.analytics, action.dataPoints, action.captureName);
      return Object.assign({}, state, {
        dataPointsForGraph: dataPoints,

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

    default:
      return state
  }
}

export default reducer
