// app.jsx
import React from 'react'
import Login from './login'
import Tester from './tester'
import { Router, Route } from 'react-router'

export default class App extends React.Component {
  render() {
    return (
      <div>
        <p> Hello Olive !!</p>
        <Tester />
        <Login />
      </div>
    )
  }
}
