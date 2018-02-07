import React, { Component } from 'react'
import jquery from 'jquery'
import { Button } from 'react-bootstrap'
import { startReplay } from '../actions'
import { connect } from 'react-redux'
import { setReplay, startNewReplay, stopReplay } from '../actions'
import ReplayDetail from './ReplayDetail'

/* Use this element as a reference when creating components*/

class Replay extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      replay: this.props.replay,
      activeReplays: this.props.activeReplays
    }

    //binding required for callback
    
    this.addReplay = this.addReplay.bind(this)
  }

  addReplay() {
    this.setState({ replay: 'Replay Active' })
    this.props.dispatch(startNewReplay())
    var postData = {
      "db": "pi",
      "captureName": "captureNameFrontend",
      "replayName": "replayNameFrontend",
      //"startTime": "now",
      "fastMode": false,
      "restoreDb": false
    }
    var that = this;
    jquery.ajax({
      url: window.location.href + 'replay',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function(data) {
      that.setState({ replay: 'Replay Inactive' })
      that.props.dispatch(stopReplay())
      console.log(data)

    })
    
  }

  displayReplays() {
    let currentReplays = []
    for (var i = 0; i < this.props.activeReplays; i++) {
      currentReplays.push(
        <li>
          <ReplayDetail
            key={'replay' + i}
            replayName={'Replay ' + (i + 1)}
            replayDate={'Jan 25, 2018'}
          />
        </li>
      )
    }
    return <ul>{currentReplays}</ul>
  }

  render() {
    return (
      <div>
        <hr />
        <Button
          style={{ marginLeft: '20px' }}
          bsSize="large"
          bsStyle="success"
          onClick={this.addReplay}
        >
          Start Replay
        </Button>
        <hr />
        <h4 style={{ marginLeft: '20px' }}>{this.state.replay}</h4>
        <div>{this.displayReplays()}</div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeReplays: state.activeReplays,
  replay: state.replay
})

export default connect(mapStateToProps)(Replay)
