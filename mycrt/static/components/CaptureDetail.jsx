import React, { Component } from 'react'
import jquery from 'jquery'
import { Button } from 'react-bootstrap'

export default class CaptureDetail extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <span style={{ display: 'inline', float: 'left' }}>
          <h4>{this.props.captureName}</h4>
          <div><span className="text-secondary">DB Instance: </span><span>{this.props.captureDB}</span></div>
          <div>{this.props.captureDate}</div>
        </span>
        <span style={{ display: 'inline', float: 'right' }}>
          <Button
            style={{ marginLeft: '20px' }}
            bsSize="large"
            bsStyle="danger"
            onClick={this.props.stopCapture}
          >
            Stop Capture
          </Button>
        </span>
      </div>
    )
  }
}
