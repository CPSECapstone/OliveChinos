import React, { Component } from 'react'
import jquery from 'jquery'
import { Button } from 'react-bootstrap'

export default class CaptureDetail extends React.Component {
  constructor(props) {
    super(props)

  }

  render() {
    let endTime = null;
    let stopCaptureButton = null;
    if (this.props.captureEndTime != "No end time..") {
      endTime = (<div><span className="text-secondary">End Time: </span><span>{this.props.captureEndTime}</span></div>)
    }
    else {
      stopCaptureButton = (<Button
        style={{ marginLeft: '20px' }}
        bsSize="large"
        bsStyle="danger"
        onClick={this.props.stopCapture.bind(this)}
      >
        Stop Capture
      </Button>
      )
    }

    return (
      <div style={{ width: '100%', padding: '15px' }}>
        <span style={{ display: 'inline', float: 'left' }}>
          <h4>{this.props.captureName}</h4>
          <div><span className="text-secondary">DB Instance: </span><span>{this.props.captureDB}</span></div>
          <div><span className="text-secondary">Start Time: </span><span>{this.props.captureStartTime}</span></div>
          {endTime}
        </span>
        <span style={{ display: 'inline', float: 'right' }}>
          {stopCaptureButton}
        </span>
      </div>
    )
  }
}
