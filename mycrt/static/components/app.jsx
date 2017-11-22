// app.jsx
import React from 'react'
import Sidebar from 'react-sidebar'
import Login from './login'
import { Router, Route } from 'react-router'
import MakeshiftHome from './MakeshiftHome'

export default class App extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      validLogin: false,
      publicKey: '',
      privateKey: '',
    }
  }

  getValidLogin() {
    if(this.state.validLogin == false) {
      return <Login publicKey={this.state.publicKey} privateKey={this.state.privateKey}/>
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