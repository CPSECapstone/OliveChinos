import React, { Component } from 'react'
import jquery from 'jquery'
import { Button } from 'react-bootstrap'

export default class ReplayDetail extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <span style={{ display: 'inline' }}>
          <h4>{this.props.replayName}</h4>
          <p>{this.props.replayDate}</p>
        </span>
      </div>
    )
  }
}
