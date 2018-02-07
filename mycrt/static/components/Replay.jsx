import React, { Component } from 'react'
import jquery from 'jquery'
import {
  Button,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  DropdownButton,
  MenuItem
} from 'react-bootstrap'
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
    this.handleReplayNameChange = this.handleReplayNameChange.bind(this)
  }

  handleReplayNameChange(event) {
    this.setState({ privateKey: event.target.value })
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

  displayDBInstancesInDropdown() {
    let currentDBInstances = []
    jquery.get(wondow.location.href + 'db_instances', data => {})
    for (var i = 0; i < data.DBInstances; i++) {
      currentDBInstances.push(<MenuItem>eventKey={i}</MenuItem>)
    }
  }

  render() {
    return (
      <div>
        <hr />
        <form>
          <FormGroup
            controlId="formBasicText"
            //validationState={this.getValidationState()}
          >
            <ControlLabel>Working example with validation</ControlLabel>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Replay Name"
              onChange={this.handleReplayNameChange}
            />
            <FormControl.Feedback />
            <HelpBlock>Validation is based on string length.</HelpBlock>
          </FormGroup>
        </form>

        <DropdownButton
          //bsStyle={title.toLowerCase()}
          title="Database Instance"
          //key={i}
          //id={`dropdown-basic-${i}`}
        >
          <MenuItem eventKey="1">DB Instance 1</MenuItem>
          <MenuItem eventKey="2">DB Instance 2</MenuItem>
          <MenuItem eventKey="3">DB Instance 3</MenuItem>
        </DropdownButton>

        <DropdownButton
          //bsStyle={title.toLowerCase()}
          title="Capture To Replay On"
          //key={i}
          //id={`dropdown-basic-${i}`}
        >
          <MenuItem eventKey="1">Capture 1</MenuItem>
          <MenuItem eventKey="2">Capture 2</MenuItem>
          <MenuItem eventKey="3">Capture 3</MenuItem>
        </DropdownButton>

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
