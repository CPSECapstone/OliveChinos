// index.jsx
import React, { Component } from 'react'
import ReactDOM from "react-dom";

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import App from './components/app';
import reducers from './reducers'
//import './node_modules/bootstrap/dist/css/bootstrap.min.css'

const createStoreWithMiddleware = applyMiddleware()(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <App />
  </Provider>,
  document.getElementById("content")
);
