import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal } from 'react-bootstrap'
import { startReplay } from '../actions'
import { connect } from 'react-redux'
import { setReplay, startNewReplay, stopReplay } from '../actions'
import ReplayDetail from './ReplayDetail'
import Flatpickr from 'react-flatpickr'
import Datetime from 'react-datetime'
import '../styles/replaystyles.css'
import { setCaptureCount, startCapture, stopCapture } from '../actions'

/* Use this element as a reference when creating components*/

class Replay extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      show: false,
      replay: this.props.replay,
      activeReplays: this.props.activeReplays,
      replayName: '',
      inputHelpBlock: 'Optional. If not provided, name will be generated.',
      captureOptions: ["No captures available"],
      replayDBInstance: '',
      captureToReplay: '',
      databaseInstanceOptions: ["No instances available"],
      completedReplayList: [null],
      fastMode: true
    }

    //binding required for callback
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.addReplay = this.addReplay.bind(this)
    this.handleReplayNameChange = this.handleReplayNameChange.bind(this)
    this.displayReplays = this.displayReplays.bind(this)
    this.loadCapturesToReplay = this.loadCapturesToReplay.bind(this)
    this.updateCaptureToReplay = this.updateCaptureToReplay.bind(this)
    this.loadDatabaseInstances = this.loadDatabaseInstances.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleCloseAndAddReplay() {
    this.setState({ show: false });
    this.addReplay;
  }

  handleShow() {
    this.setState({ show: true });
  }

  componentDidMount() {
    this.loadDatabaseInstances()
    this.loadCapturesToReplay()
    this.displayReplays()
  }

  handleReplayNameChange(event) {
    this.setState({ replayName: event.target.value });
  }

  handleModeChange(event) {
    this.setState({ fastMode: !this.state.fastMode })
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
    var captures = data
    let captureList = [];
    for (var i = 0; i < captures.length; i++) {
      var capture_name = captures[i];
      var selectOption = (<option value={capture_name} key={i}>
        {capture_name}
      </option>)
      captureList.push(selectOption)
    }
    return captureList
  }

  loadCapturesToReplay() {
    var that = this;
    jquery.ajax({
      url: window.location.href + 'capture/completed_list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      var resultList = that.createCapturesSelect(data)
      that.setState({ captureOptions: resultList })
      that.setState({ captureToReplay: resultList[0].props.value })

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
      "db": this.state.replayDBInstance,
      "captureName": this.state.captureToReplay,
      "replayName": this.state.replayName.length > 0 ? this.state.replayName : '',
      //"startTime": "now",
      "fastMode": this.state.fastMode,
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
      that.props.dispatch(stopReplay())
      that.displayReplays()

    })

  }

  updateCaptureToReplay(e) {
    this.setState({ captureToReplay: e.target.value });
  }

  updateReplayDB(e) {
    this.setState({ replayDBInstance: e.target.value });
  }


  getReplays(data) {
    var completedReplays = [];
    var currentTup;
    var currentCapture;
    var currentReplayArr;
    var currentReplay;
    console.log("DATA\n", data)
    // List of replays is list of tuples : Each tuple is structured (Capture, Listof Replay)
    for (var i = 0; i < data.length; i++) {
      currentTup = data[i]
      currentCapture = currentTup[0]
      currentReplayArr = currentTup[1]
      // console.log('replay item ', i, ": ", current.replayName)
      var that = this
      for (var j = 0; j < currentReplayArr.length; j++) {
        currentReplay = currentReplayArr[j]
        completedReplays.push((function (currentReplay, i, j, that) {
          return (<ListGroupItem style={{ height: '150px' }} key={currentReplay + i + "-" + j}>
            <ReplayDetail
              className="replayDetail"
              replayCapture={currentCapture}
              replayName={currentReplay}
            // replayDB={currentReplay.db}
            // replayDate={currentReplay.date}
            //stopCapture={() => { that.stopCapture(current.captureName, current.db, i) }}
            />
          </ListGroupItem>)
        }(currentReplay, i, j, that)))
      }
    }
    return <ListGroup>{completedReplays}</ListGroup>
  }

  displayReplays() {
    var that = this;
    jquery.ajax({
      url: window.location.href + 'replay/list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      var resultList = that.getReplays(data)
      that.setState({ completedReplayList: resultList })
    })
  }

  render() {
    return (
      <div>
        <div>
          <div id="replayTitle">
            <h3 style={{ marginLeft: '20px' }}>Replay 2</h3>
          </div>

          <div id="newReplayBtnContainer">
            <Button
              id="newReplayBtn"
              //style={{ marginLeft: '' }}
              bsSize="xsmall"
              bsStyle="primary"
              onClick={this.handleShow}
            >
              New Replay
            </Button>
          </div>
        </div>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>New Replay</Modal.Title>
          </Modal.Header>
          <Modal.Body>
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
                <FormControl componentClass="select" placeholder="select" value={this.state.replayDBInstance} onChange={this.updateReplayDB}>
                  {this.state.databaseInstanceOptions}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <div>
                  <ButtonToolbar>
                    <ToggleButtonGroup type="radio" name="options" value={this.state.fastMode} onChange={this.handleModeChange}>
                      <ToggleButton value={true}>Fast Mode</ToggleButton>
                      <ToggleButton value={false}>Time-Based Mode</ToggleButton>
                    </ToggleButtonGroup>
                  </ButtonToolbar>
                </div>
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
            <Button bsStyle="primary" onClick={this.handleCloseAndAddReplay}>Start Replay</Button>
          </Modal.Footer>
        </Modal>

        <br />

        <div id="replayBody">
          <div>{this.state.completedReplayList}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeReplays: state.activeReplays,
  replay: state.replay
})

export default connect(mapStateToProps)(Replay)
