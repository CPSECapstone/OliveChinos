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
    this.startReplay = this.startReplay.bind(this)
    this.addReplay = this.addReplay.bind(this)
  }

  startReplay() {
    this.setState({ replay: 'Replay Active' })
    this.props.dispatch(setReplay())
    jquery.post(window.location.href + 'replay', data => {
      this.setState({ replay: 'Replay Inactive' })
      this.props.dispatch(setReplay())
      console.log(data)
    })
  }

  addReplay() {
    this.setState({ replay: 'Replay Active' })
    this.props.dispatch(startNewReplay())
    jquery.post(window.location.href + 'replay', data => {
      this.setState({ replay: 'Replay Inactive' })
      this.props.dispatch(stopReplay())
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
