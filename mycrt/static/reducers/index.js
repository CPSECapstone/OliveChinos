//Redux stuff
//Ask Yeng if you have questions!

import {
  SET_PUBLIC_KEY,
  SET_PRIVATE_KEY,
  CHANGE_KEYS,
  SET_AUTH,
  START_CAPTURE,
  STOP_CAPTURE,
  SET_REPLAY
} from '../actions/constants'

let initialState = {
  name: "",
  privateKey: '',
  publicKey: '',
  error: '',
  loggedIn: false,
  captureActive: false,
  replayActive: false,
  capture: 'Capture Inactive',
  replay: 'Replay Inactive'
}

function reducer(state = initialState, action) {
  switch (action.type) {
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
        captureActive: true,
        capture: 'Capture Active'
      })

    case STOP_CAPTURE:
    return Object.assign({}, state, {
        captureActive: false,
        capture: 'Capture Inactive'
      })

    case SET_REPLAY:
    return Object.assign({}, state, {
        replayActive: !state.replayActive,
        replay: 'Replay Active'
      })

    default:
      return state
  }
}

export default reducer
