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
  STOP_REPLAY
} from './constants'

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
