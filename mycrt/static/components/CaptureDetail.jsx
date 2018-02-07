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
        <span style={{ display: 'inline' }}>
          <h4>{this.props.captureName}</h4>
          <p>{this.props.captureDate}</p>
        </span>
        <span style={{ display: 'inline' }}>
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
