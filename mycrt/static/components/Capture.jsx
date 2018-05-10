import React, { Component } from 'react'
import jquery from 'jquery'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert, Glyphicon } from 'react-bootstrap'
import 'flatpickr/dist/themes/material_green.css'
import '../styles/capturestyles.css'
import InfoCapture from './InfoCapture'
import ReplayForm from './ReplayForm'
import Flatpickr from 'react-flatpickr'
import Datetime from 'react-datetime'
import { connect } from 'react-redux'
import {
  setCaptureCount,
  startCapture,
  stopCapture,
  changeStateForComponents,
  startReplayFromCapture,
  setCaptureActiveList,
  setCaptureCompletedList,
  setCaptureScheduledList,
  setDatabaseInstances,
  setIsCapturesLoaded,
  setIsReplaysLoaded,
  fetchCaptures,
  fetchReplays
} from '../actions'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import CaptureList from './CaptureList'

class Capture extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showAlert: false,
      alertError: '',
      show: false,
      capture: this.props.capture,
      activeCaptures: this.props.activeCaptures,
      haveCaptureData: false,
      captureData: '',
      query: '',
      captureName: '',
      inputHelpBlock: 'Optional. If not provided, name will be generated.',
      databaseInstanceOptions: ["No instances available"],
      captureRDSInstance: '',
      captureDBName: '',
      captureDBUsername: '',
      captureDBPassword: '',
      activeCaptureObjects: [],
      activeCaptureList: [],
      completedCaptureList: [],
      scheduledCaptureList: [],
      captureStartTime: new Date(),
      captureEndTime: new Date(),
      captureMode: 'interactive',
      captureInfoShow: false
    }

    //binding required for callback
    this.handleShowAlert = this.handleShowAlert.bind(this);
    this.handleCloseAlert = this.handleCloseAlert.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.startNewCapture = this.startNewCapture.bind(this)

    this.handleCaptureNameChange = this.handleCaptureNameChange.bind(this)
    this.updateCaptureRDS = this.updateCaptureRDS.bind(this)
    this.handleDBNameChange = this.handleDBNameChange.bind(this)
    this.handleDBUsernameChange = this.handleDBUsernameChange.bind(this)
    this.handleDBPasswordChange = this.handleDBPasswordChange.bind(this)

    this.handleModeChange = this.handleModeChange.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleRefreshButton = this.handleRefreshButton.bind(this)
    this.handleCloseAndStartCapture = this.handleCloseAndStartCapture.bind(this)
    this.setAlertError = this.setAlertError.bind(this)
  }

  // Sets state of error alert to close
  handleCloseAlert() {
    this.setState({ showAlert: false });
  }

  // Sets state of error alert to show
  handleShowAlert() {
    this.setState({ showAlert: true });
  }

  setAlertError(errorMessage) {
    this.setState({ alertError: errorMessage });
  }

  // Closes the new capture modal
  handleClose() {
    this.setState({ show: false });
  }

  // Starts a new capture and closes the new capture modal
  handleCloseAndStartCapture() {
    this.startNewCapture();
    this.setState({ show: false });
  }

  // Sets the state to show the new capture modal
  handleShow() {
    this.setState({ show: true });
  }

  handleRefreshButton() {
    this.props.dispatch(fetchCaptures());
  }


  // Starts a new capture by calling a get request to the server
  startNewCapture() {
    //this.setState({ capture: 'New Capture Started' })

    let postData;

    
    let rdsInstance;
    if (this.state.captureRDSInstance === '') {
      rdsInstance = this.props.databaseInstances.databases[0];
    }
    else {
      rdsInstance = this.state.captureRDSInstance;
    }

    if (this.state.captureMode === 'schedule') {
      var now = new Date();
      var timezoneOffset = now.getTimezoneOffset();
      console.log("Capture start time", this.state.captureStartTime);

      postData = {
        "db": this.state.captureDBName,
        "rds": rdsInstance,
        "captureName": this.state.captureName.length > 0 ? this.state.captureName : '',
        "username": this.state.captureDBUsername,
        "password": this.state.captureDBPassword,
        "startTime": this.state.captureStartTime,
        "endTime": this.state.captureEndTime
      }
    }
    else {
      //this.props.dispatch(startCapture());
      postData = {
        "db": this.state.captureDBName,
        "rds": rdsInstance,
        "captureName": this.state.captureName.length > 0 ? this.state.captureName : '',
        "username": this.state.captureDBUsername,
        "password": this.state.captureDBPassword,
      }
    }
    let that = this
    jquery.ajax({
      url: window.location.href + 'capture/start',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      dataType: 'json'
    })
      .done(function (data) {
        that.props.dispatch(fetchCaptures());
      })
      .fail(function (data) {
        if (data.status === 400) {
          that.setAlertError("Looks like the capture name you provided '" + postData.captureName + "' is not unique. Please provide a unique capture name.");
        }
        else if (data.status === 401) {
          that.setAlertError("Database name and/or username/password incorrect. Unable to connect to database: '" + postData.db + "'");
        }
        else {
          that.setAlertError("Unknown Error");
        }
        that.handleShowAlert()
      })
  }



  // Changes the help text for the capture name form
  getValidationState() {
    if (this.state.captureName.indexOf(' ') >= 0 || this.state.captureName.indexOf('/') >= 0) {
      this.state.inputHelpBlock = 'No spaces or / allowed in name. Please try again';
      return 'error';
    }
    else if (this.state.captureName.length > 0) {
      this.state.inputHelpBlock = 'Looks great!';
      return 'success';
    }
    else if (this.state.captureName.length == 0) {
      this.state.inputHelpBlock = 'Optional. If not provided, name will be generated.';
      return null;
    }
    else return null;
  }

  // Sets the state of the capture name to show changes in the capture name form
  handleCaptureNameChange(event) {
    this.setState({ captureName: event.target.value });
  }

  // Sets the state of the Database name to show changes in the capture db name form
  handleDBNameChange(event) {
    this.setState({ captureDBName: event.target.value })
  }

  // Sets the state of the username to show changes in the capture username form
  handleDBUsernameChange(event) {
    this.setState({ captureDBUsername: event.target.value })
  }

  // Sets the state of the password to show changes in the capture password form
  handleDBPasswordChange(event) {
    this.setState({ captureDBPassword: event.target.value })
  }

  // Changes the capture mode between interactive and scheduled
  handleModeChange(event) {
    console.log(event)
    this.setState({ captureMode: event })
    console.log(this.state.captureMode)
  }

  // Consumes a list of rds instances and produces a select menu of these instances
  createDBInstancesSelect(data) {
    let dbInstances = data["databases"] || [];
    let dbList = [];
    for (let i = 0; i < dbInstances.length; i++) {
      let instance = dbInstances[i];
      let selectOption = (<option value={instance} key={i}>
        {instance}
      </option>)
      dbList.push(selectOption)
    }
    
    return dbList
  }

  // Changes the selected rds instance for capture
  updateCaptureRDS(e) {
    this.setState({ captureRDSInstance: e.target.value });
  }


  // Consumes a capture type and produces a table of captures retrieved from the server
  displayCaptures(captureType) {
    let captureRoute;
    if (captureType === 'active') {
      captureRoute = 'list_ongoing'
    }
    else if (captureType === 'scheduled') {
      captureRoute = 'list_scheduled'
    }
    else {
      captureRoute = 'list_completed'
    }

    let that = this;
    jquery.ajax({
      url: window.location.href + 'capture/' + captureRoute,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      if (captureType === 'active') {
        that.props.dispatch(setCaptureCount(data.captures.length))
        that.props.dispatch(setCaptureActiveList(data.captures));
      }
      else if (captureType === 'scheduled') {
        that.props.dispatch(setCaptureScheduledList(data.captures));
      }
      else {
        that.props.dispatch(setCaptureCompletedList(data.captures));
      }
    })
  }

  render() {
    let captureScheduler = null;
    let that = this;
    let captureInfoClose = () => this.setState({ captureInfoShow: false })
    if (this.state.captureMode == 'schedule') {
      captureScheduler = <FormGroup>
        <ControlLabel>Capture Schedule</ControlLabel>
        <table>
          <tbody>
            <tr><td id='captureStartTimeContainer'><div>Start Time</div>
              <Flatpickr data-enable-time
                value={this.state.captureStartTime}
                onChange={date => {
                  this.setState({ captureStartTime: date })
                }} /></td>
              <td><div>End Time</div>
                <Flatpickr data-enable-time
                  value={this.state.captureEndTime}
                  onChange={date => {
                    this.setState({ captureEndTime: date })
                  }} /></td></tr>
          </tbody>
        </table>
      </FormGroup>
    }

    let uniqueNameAlert = null;
    if (this.state.showAlert) {
      uniqueNameAlert = <Alert bsStyle="danger" onDismiss={this.handleCloseAlert}>
        <h4>Oh snap! You got an error!</h4>
        <p>{this.state.alertError}</p>
        <p>
          <Button onClick={this.handleCloseAlert}>Hide Alert</Button>
        </p>
      </Alert>
    }

    console.log("this.props.databaseInstances[0]", this.props.databaseInstances);


    return (
      <div>
        <div>
          <div id="captureTitle">
            <h3 style={{ marginLeft: '20px' }}>Captures
            <Glyphicon style={{ paddingLeft: '20px', cursor: 'pointer' }} glyph="info-sign"
                onClick={() => this.setState({ captureInfoShow: true })} />
            </h3>

          </div>

          <div className="row captureActionButtonsContainer">
            <div id="newCaptureBtnContainer">
              <Button id="refreshCapturesButton" onClick={this.handleRefreshButton}>
                Refresh Capture
              </Button>
              <Button
                id="newCaptureBtn"
                //style={{ marginLeft: '' }}

                bsStyle="primary"
                onClick={this.handleShow}
              >
                New Capture
            </Button>
            </div>
          </div>
        </div>


        <Modal show={this.state.show} onHide={this.handleClose} backdrop='static' enforceFocus={false}>
          <Modal.Header closeButton>
            <Modal.Title>New Capture</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <FormGroup
                controlId="formBasicText"
                validationState={this.getValidationState()}
              >
                <ControlLabel>Capture Name</ControlLabel>
                <FormControl
                  //id='captureNameInput'
                  type="text"
                  value={this.state.captureName}
                  placeholder="Enter name"
                  onChange={this.handleCaptureNameChange}
                />
                <FormControl.Feedback />
                <HelpBlock>{this.state.inputHelpBlock}</HelpBlock>
              </FormGroup>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>RDS Instance</ControlLabel>
                <FormControl componentClass="select" placeholder="select" value={this.state.captureRDSInstance} onChange={this.updateCaptureRDS}>
                  {this.createDBInstancesSelect(this.props.databaseInstances)}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel>DB Name</ControlLabel>
                <FormControl type="text" placeholder="Enter name" value={this.state.captureDBName} onChange={this.handleDBNameChange} />
              </FormGroup>
              <FormGroup id="dbInfoForm">
                <Col className="dbInfoFormCol" sm={6}>
                  <ControlLabel>DB Username</ControlLabel>
                  <FormControl type="text" placeholder="Enter username" value={this.state.captureDBUsername} onChange={this.handleDBUsernameChange} />
                </Col>
                <Col className="dbInfoFormCol" sm={6}>
                  <ControlLabel>DB Password</ControlLabel>
                  <FormControl type="password" placeholder="Enter password" value={this.state.captureDBPassword} onChange={this.handleDBPasswordChange} />
                </Col>
              </FormGroup>
              <FormGroup>
                <div className="modeButtonContainer">
                  <ButtonToolbar>
                    <ToggleButtonGroup type="radio" name="options" value={this.state.captureMode} onChange={this.handleModeChange}>
                      <ToggleButton id="toggle" value='interactive'>Interactive Mode</ToggleButton>
                      <ToggleButton id="toggle" value='schedule'>Schedule Mode</ToggleButton>
                    </ToggleButtonGroup>
                  </ButtonToolbar>
                </div>
              </FormGroup>
              {captureScheduler}
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
            <Button bsStyle="primary" onClick={this.handleCloseAndStartCapture}>Start New Capture</Button>
          </Modal.Footer>
        </Modal>

        <ReplayForm onReplayPage={false} captureToReplay={this.props.captureToReplay} store={this.props} show={this.props.showReplayModal} />

        <InfoCapture show={this.state.captureInfoShow} onHide={captureInfoClose} />

        <br />

        <div id="captureBody">
          {uniqueNameAlert}

          <CaptureList />

        </div>
      </div >
    )
  }
}

const mapStateToProps = state => ({
  activeCaptures: state.activeCaptures,
  capture: state.capture,
  showReplayModal: state.showReplayModal,
  isCapturesLoaded: state.isCapturesLoaded,
  databaseInstances: state.databaseInstances,
  capturesActive: state.capturesActive,
  capturesCompleted: state.capturesCompleted,
  capturesScheduled: state.capturesScheduled,
  captureToReplay: state.captureToReplay

})

export default connect(mapStateToProps)(Capture)
