import React, { Component } from 'react'
import jquery from 'jquery'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { startCapture, stopCapture } from '../actions'
import CaptureDetail from './CaptureDetail'

/* Use this element as a reference when creating components*/

class Capture extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      capture: this.props.capture,
      activeCaptures: this.props.activeCaptures,
      haveCaptureData: false,
      captureData: '',
      query: ''
    }

    //binding required for callback
    this.startCapture = this.startCapture.bind(this)
    this.stopCapture = this.stopCapture.bind(this)
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.sendQuery = this.sendQuery.bind(this)
  }

  startCapture() {
    this.setState({ capture: 'New Capture Started' })
    this.props.dispatch(startCapture())
    var postData = {
      "db": "pi", 
      "captureName": "captureNameFrontend"
      //"startTime": "now"
    }
    jquery.ajax({
      url: window.location.href + 'capture/start',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(data) {
      console.log(data);
    })
    
  }

  stopCapture() {
    this.setState({ capture: 'Capture Stopped' })
    this.props.dispatch(stopCapture())
    var postData = {
      "db": "pi",
      "captureName": "captureNameFrontend"
    }
    var that = this;
    jquery.ajax({
      url: window.location.href + 'capture/end',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(data) {
      that.setState({ haveCaptureData: true })
      that.setState({ captureData: data })

    })
    
  }

  renderCaptureData() {
    if (this.state.haveCaptureData == true) {
      return (
        <h4 style={{ marginLeft: '20px', border: '1px solid' }}>
          <div
            style={{ overflowY: 'scroll', height: '24vh', resize: 'vertical' }}
          >
            <pre>{JSON.stringify(this.state.captureData, null, 2)}</pre>
          </div>
        </h4>
      )
    }
  }

  handleQueryChange(event) {
    this.setState({ query: event.target.value })
  }

  sendQuery() {
    var queryJSON = {
      query: this.state.query
    }
    var returnVal = jquery.ajax({
      url: window.location.href + 'capture/executeQuery',
      type: 'POST',
      data: JSON.stringify(queryJSON),
      contentType: 'application/json',
      dataType: 'json'
    })
  }

  displayCaptures() {
    let currentCaptures = []
    console.log('display')
    console.log(this.props.activeCaptures)
    for (var i = 0; i < this.props.activeCaptures; i++) {
      currentCaptures.push(
        <li>
          <CaptureDetail
            key={'capture' + i}
            captureName={'Capture ' + (i + 1)}
            captureDate={'Jan 25, 2018  '}
            stopCapture={this.stopCapture}
          />
        </li>
      )
    }
    return <ul>{currentCaptures}</ul>
  }

  render() {
    return (
      <div>
        <hr />
        <Button
          style={{ marginLeft: '20px' }}
          bsSize="large"
          bsStyle="success"
          onClick={this.startCapture}
        >
          Start Capture
        </Button>
        {/*<Button
          style={{ marginLeft: '20px' }}
          bsSize="large"
          bsStyle="danger"
          onClick={this.stopCapture}
        >
          Stop Capture
        </Button>*/}
        <input
          style={{ marginLeft: '20px' }}
          onChange={this.handleQueryChange}
        />
        <Button className="btn-md" onClick={this.sendQuery}>
          Send Query
        </Button>
        <hr />
        <h4 style={{ marginLeft: '20px' }}>{this.state.capture}</h4>
        {this.renderCaptureData()}
        <br />
        <div>{this.displayCaptures()}</div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeCaptures: state.activeCaptures,
  capture: state.capture
})

export default connect(mapStateToProps)(Capture)
