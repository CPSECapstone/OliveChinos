import {combineReducers} from 'redux';

import {
  SET_PUBLIC_KEY,
  SET_PRIVATE_KEY,
  CHANGE_KEYS,
  SET_AUTH,
  SET_CAPTURE,
  SET_REPLAY
} from '../actions/constants'

let initialState = {
  name: "",
  privateKey: '',
  publicKey: '',
  error: '',
  loggedIn: false,
  captureActive: false,
  replayActive: false
}

function reducer(state = initialState, action) {
  console.log(action);
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
    case SET_CAPTURE:
    return Object.assign({}, state, {

        captureActive: !state.captureActive
      })
    case SET_REPLAY:
    return Object.assign({}, state, {

        replayActive: !state.replayActive
      })
    default:
      return state
  }
}

export default reducer
