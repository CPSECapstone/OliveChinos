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
    let captureIcon = null;
    let replayCaptureButton = null;
    // If the capture is a scheduled capture 
    if (this.props.captureEndTime != "No end time..") {
      endTime = (<div><span className="text-secondary">End Time: </span><span>{this.props.captureEndTime}</span></div>)
      //captureIcon = <span className="glyphicon glyphicon-time"></span>
    }
    else {
      captureIcon = null;
      //captureIcon = <span className="glyphicon glyphicon-play-circle"></span>
    }

    if (this.props.captureType === 'past') {
      replayCaptureButton = (<Button
        style={{ marginLeft: '10px' }}
        bsSize="small"
        bsStyle='danger'
        onClick={this.props.replayCapture.bind(this)}
      >
        {this.props.captureEditAction}
      </Button>)

    }

    return (
      <div style={{ width: '100%', padding: '15px' }}>
        <span style={{ display: 'inline', float: 'left' }}>
          <div><span style={{ display: 'inline' }}><h4>{this.props.captureName}</h4></span>{captureIcon}</div>
          <div><span className="text-secondary">DB Instance: </span><span>{this.props.captureDB}</span></div>
          <div><span className="text-secondary">Start Time: </span><span>{this.props.captureStartTime}</span></div>
          {endTime}
        </span>
        <span style={{ display: 'inline', float: 'right' }}>
          {replayCaptureButton}
          <Button
            style={{ marginLeft: '10px' }}
            bsSize="small"
            bsStyle='danger'
            onClick={this.props.editCapture.bind(this)}
          >
            {this.props.captureEditAction}
          </Button>
        </span>
      </div>
    )
  }
}
