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
    // return(
    //   <div>
    //     <MakeshiftHome />
    //   </div>
    // );
    // return(
    //   <div>
    //     <h1 style={{textAlign:'center', marginBottom:'30px'}}>MyCRT Tool</h1>
    //     <div>
    //       <div className="tab">
    //         <button className="tablinks" onClick={() => this.renderCapture()} id="button" type="button">Capture</button>
    //         <button className="tablinks" onClick={() => this.renderReplay()}>Replay</button>
    //         <button className="tablinks" onClick={() => this.renderAnalyze()}>Analyze</button>
    //       </div>
    //       {this.renderPage()}
    //     </div>
    //   </div>
    // );
    return (
      <div>
        {this.getValidLogin()}
        </div>
    );
  }
}