import React, { Component } from 'react'
import jquery from 'jquery'
import { Button } from 'react-bootstrap'

export default class ReplayDetail extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (

      <div style={{ width: '100%', padding: '15px' }}>
        <span style={{ display: 'inline', float: 'left' }}>
          <h4>{this.props.replayName}</h4>
          <div><span className="text-secondary">DB Instance: </span><span>{this.props.replayDB}</span></div>
          <div><span className="text-secondary">Replay Date: </span><span>{this.props.replayDate}</span></div>
        </span>
        <span style={{ display: 'inline', float: 'right' }}>
          <Button
            style={{ marginLeft: '20px' }}
            bsSize="large"
            bsStyle="success"
          //onClick={this.props.stopCapture.bind(this)}
          >
            Analyze
      </Button>
        </span>
      </div>
    )
  }
}
