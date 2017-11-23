import {
SET_PUBLIC_KEY,
SET_PRIVATE_KEY,
CHANGE_KEYS,
SET_AUTH,
SET_CAPTURE,
SET_REPLAY
} from './constants'

export function setPublicKey(key) {
  return {type: SET_PUBLIC_KEY, key}
}

export function setPrivateKey(key) {
  return {type: SET_PRIVATE_KEY, key}
}

export function changeKeys(formState) {
  return {type: CHANGE_KEYS, formState}
}

export function setAuth() {
  return {type: SET_AUTH}
}

export function setCapture() {
  return {type: SET_CAPTURE}
}
export function setReplay() {
  return {type: SET_REPLAY}
}
