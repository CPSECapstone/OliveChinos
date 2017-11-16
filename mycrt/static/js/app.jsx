// app.jsx
import React from 'react'
import Sidebar from 'react-sidebar'
import Login from './login'
import Tester from './tester'
import StaticHome from './StaticHome'
import { Router, Route } from 'react-router'

export default class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      validLogin: false
    }
  }

  getValidLogin() {
    if(this.state.validLogin == false) {
      return <Login/>
    }
    else {
      return <StaticHome/>
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
