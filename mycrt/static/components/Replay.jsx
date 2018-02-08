import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap'
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
      activeReplays: this.props.activeReplays,
      replayName: '',
      inputHelpBlock: 'Optional. If not provided, name will be generated.',
      captureOptions: ["No captures available"],
      replayDBInstance: '',
      captureToReplay: '',
      databaseInstanceOptions: ["No instances available"],
      activeReplayList: [null]

    }

    //binding required for callback

    this.addReplay = this.addReplay.bind(this)
    this.handleReplayNameChange = this.handleReplayNameChange.bind(this)
    this.loadCapturesToReplay = this.loadCapturesToReplay.bind(this)
    this.updateCaptureToReplay = this.updateCaptureToReplay.bind(this)
  }

  componentDidMount() {
    this.loadCapturesToReplay()
    this.displayReplays()
  }

  handleReplayNameChange(event) {
    this.setState({ replayName: event.target.value });
  }

  getValidationState() {
    if (this.state.replayName.indexOf(' ') >= 0) {
      this.state.inputHelpBlock = 'No spaces allowed in name. Please try again';
      return 'error';
    }
    else if (this.state.replayName.length > 0) {
      this.state.inputHelpBlock = 'Looks great!';
      return 'success';
    }
    else if (this.state.replayName.length == 0) {
      this.state.inputHelpBlock = 'Optional. If not provided, name will be generated.';
      return null;
    }
    else return null;
  }


  createCapturesSelect(data) {
    var captures = data["databases"];
    let captureList = [];
    for (var i = 0; i < captures.length; i++) {
      var instance = captures[i];
      var selectOption = (<option value={instance} key={i}>
        {instance}
      </option>)
      captureList.push(selectOption)
    }
    return captureList
  }

  loadCapturesToReplay() {
    var that = this;
    jquery.ajax({
      url: window.location.href + 'capture/list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      var resultList = that.createCapturesSelect(data)
      that.setState({ captureOptions: resultList })
    })
  }


  createDBInstancesSelect(data) {
    var dbInstances = data["databases"];
    let dbList = [];
    for (var i = 0; i < dbInstances.length; i++) {
      var instance = dbInstances[i];
      var selectOption = (<option value={instance} key={i}>
        {instance}
      </option>)
      dbList.push(selectOption)
    }
    return dbList
  }

  loadDatabaseInstances() {
    var that = this;
    let returnList = []
    jquery.ajax({
      url: window.location.href + 'databaseInstances',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      returnList = that.createDBInstancesSelect(data)
      that.setState({
        databaseInstanceOptions: returnList
      })
      that.setState({ replayDBInstance: returnList[0].props.value })
    })
  }


  addReplay(replayName, captureName, replayDB) {
    this.setState({ replay: 'Replay Active' })
    this.props.dispatch(startNewReplay())
    var postData = {
      "db": replayDB,
      "captureName": captureName,
      "replayName": replayName,
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
    }).done(function (data) {
      that.setState({ replay: 'Replay Inactive' })
      that.props.dispatch(stopReplay())
      console.log(data)

    })

  }

  updateCaptureToReplay(e) {
    this.setState({ captureToReplay: e.target.value });
  }

  updateReplayDB(e) {
    this.setState({ replayDBInstance: e.target.value });
  }


  getReplays(data) {
    var currentReplays = [];
    var current;
    for (var i = 0; i < this.props.activeReplays; i++) {
      current = data[i]
      currentReplays.push(
        <li key={current.name + i}>
          <ReplayDetail
            captureName={current.replayName}
            captureDB={current.db}
            captureDate={current.startTime}
          />
        </li>
      )
    }
    return <ul>{currentReplays}</ul>
  }

  displayReplays() {
    var that = this;
    jquery.ajax({
      // TODO: Add route for current replays
      url: window.location.href + 'replays/list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      var resultList = that.getReplays(data)
      that.setState({ activeReplayList: resultList })
    })
  }

  render() {
    return (
      <div>
        <hr />
        <form>
          <FormGroup
            //controlId="formBasicText"
            validationState={this.getValidationState()}
          >
            <ControlLabel>Replay Name</ControlLabel>
            <FormControl
              id='replayNameInput'
              type="text"
              value={this.state.replayName}
              placeholder="Enter name"
              onChange={this.handleReplayNameChange}
            />
            <FormControl.Feedback />
            <HelpBlock>{this.state.inputHelpBlock}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="formControlsSelect">
            <ControlLabel>Capture To Replay</ControlLabel>
            <FormControl componentClass="select" placeholder="select" value={this.state.captureToReplay} onChange={this.updateCaptureToReplay}>
              {this.state.captureOptions}
            </FormControl>
          </FormGroup>
          <FormGroup controlId="formControlsSelect">
            <ControlLabel>Database Instance</ControlLabel>
            <FormControl componentClass="select" placeholder="select" value={this.state.captureDBInstance} onChange={this.updateReplayDB}>
              {this.state.databaseInstanceOptions}
            </FormControl>
          </FormGroup>
        </form>

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
