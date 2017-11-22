// app.jsx
import React from 'react'
import Sidebar from 'react-sidebar'
import Login from './login'
// import StaticHome from './StaticHome'
import { Router, Route } from 'react-router'
// require('../styles/tabstyles.css');
import MakeshiftHome from './MakeshiftHome'

export default class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      validLogin: false,
      publicKey: '',
      privateKay: '',
    }
  }

  getValidLogin() {
    if(this.state.validLogin == false) {
      return <Login />
    }
    else {
      return <MakeshiftHome />
    }
  }

  render() {
    /* CHANGE validLogin TO TRUE FOR TESTING PURPOSES */
    // this.setState({validLogin: false});
    return (
      <div>
        {this.getValidLogin()}
        </div>
    );
  }
}