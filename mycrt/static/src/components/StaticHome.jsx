import React, { Component } from 'react'
import Analytics from "./Analytics";

export default class StaticHome extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      captureStatus: false,
      replayStatus: false
    }
  }

  changeCaptureStatus() {
    if(this.state.captureStatus == true) {
      this.setState({captureStatus: false})
    }
    else {
      this.setState({captureStatus: true})
    }
    this.renderCaptureStatus();
  }

  changeReplayStatus() {
    if(this.state.replayStatus == true) {
      this.setState({replayStatus: false})
    }
    else {
      this.setState({replayStatus: true})
    }
    this.renderCaptureStatus();
  }

  renderCaptureStatus() {
    var status;
    if(this.state.captureStatus == true) {
      status = <h3 
      style={{
          backgroundColor: '#95ba6c',
          border: '1px solid black',
          textAlign: 'center'
        }}>Capture Active</h3>;
    }
    else {
      status = <h3
      style={{
          backgroundColor: '#bab86c',
          border: '1px solid black',
          textAlign: 'center'
        }}>Capture Inactive</h3>;
    }
    return status;
  }

  renderReplayStatus() {
    var status;
    if(this.state.replayStatus == true) {
      status = 
      <h3 
        style={{
          backgroundColor: '#95ba6c',
          border: '1px solid black',
          textAlign: 'center',
        }}
        className="green" >
          Replay Active
        </h3>;
    }
    else {
      status = 
      <h3 
        style={{
          backgroundColor: '#bab86c',
          border: '1px solid black',
          textAlign: 'center',
        }}
        className="red">
          Replay Inactive
      </h3>;
    }
    return status;
  }


  render() {
    return (
      <div 
        style={{
          backgroundColor: '#e5e5e5',
          paddingTop: '20px',
          height: '100vh'
          }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '30px'}}>MyCRT Tool ****</h1>
        <div>
          <h3
          style={{
            textAlign: 'center'
          }}>Database Name: Olive Chinos</h3>
          <div style={{textAlign: 'center'}}>
          <button style={{backgroundColor:'#3e6382'}}onClick={() => this.changeCaptureStatus()} id="button" type="button" className="btn btn-primary">New Capture</button>
          </div>
          {this.renderCaptureStatus()}
        </div>
        <hr/>

        <div>
          <h3 style={{
            textAlign: 'center'
          }}>Database Name: Olive Chinos</h3>
          <div style={{textAlign:'center'}}>
          <button style={{backgroundColor:'#3e6382'}} onClick={() => this.changeReplayStatus()} id="button" type="button" className="btn btn-primary">New Replay</button>
          </div>
          {this.renderReplayStatus()}
        </div>
        <hr/>

        <div>
          <h3 style={{
            textAlign: 'center'
          }}>Metrics</h3>
          <div style={{textAlign: 'center'}}>
          <button style={{backgroundColor:'#3e6382'}} id="button" type="button" className="btn btn-primary">Refresh Metrics</button>
          </div>
        </div>

        <Analytics />

      </div>
    )
  }
}
