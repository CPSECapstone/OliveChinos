import React, { Component } from 'react'
import jquery from 'jquery'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'
import 'flatpickr/dist/themes/material_green.css'
import '../styles/capturestyles.css'
import Flatpickr from 'react-flatpickr'
import Datetime from 'react-datetime'
import { connect } from 'react-redux'
import { setCaptureCount, startCapture, stopCapture, changeStateForComponents } from '../actions'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import CaptureList from './CaptureList'

class Capture extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showAlert: false,
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
      captureMode: 'interactive'
    }

    //binding required for callback
    this.handleShowAlert = this.handleShowAlert.bind(this);
    this.handleCloseAlert = this.handleCloseAlert.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.startNewCapture = this.startNewCapture.bind(this)
    this.editCapture = this.editCapture.bind(this)
    // this.getCaptures = this.getCaptures.bind(this)

    this.handleCaptureNameChange = this.handleCaptureNameChange.bind(this)
    this.updateCaptureRDS = this.updateCaptureRDS.bind(this)
    this.handleDBNameChange = this.handleDBNameChange.bind(this)
    this.handleDBUsernameChange = this.handleDBUsernameChange.bind(this)
    this.handleDBPasswordChange = this.handleDBPasswordChange.bind(this)

    this.loadDatabaseInstances = this.loadDatabaseInstances.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseAndStartCapture = this.handleCloseAndStartCapture.bind(this)
    this.getCapturesTable = this.getCapturesTable.bind(this)

  }

  // Refreshs database instances and capture lists when component fully renders
  componentDidMount() {
    this.loadDatabaseInstances()
    this.displayAllCaptures()
  }

  // Sets state of error alert to close
  handleCloseAlert() {
    this.setState({ showAlert: false });
  }

  // Sets state of error alert to show
  handleShowAlert() {
    this.setState({ showAlert: true });
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

  // Starts a new capture by calling a get request to the server
  startNewCapture() {
    this.setState({ capture: 'New Capture Started' })
    this.props.dispatch(startCapture())
    let postData;
    console.log(this.state.captureMode)
    if (this.state.captureMode === 'schedule') {
      postData = {
        "db": this.state.captureDBName,
        "rds": this.state.captureRDSInstance,
        "captureName": this.state.captureName.length > 0 ? this.state.captureName : '',
        "username": this.state.captureDBUsername,
        "password": this.state.captureDBPassword,
        "startTime": this.state.captureStartTime,
        "endTime": this.state.captureEndTime
      }
    }
    else {
      postData = {
        "db": this.state.captureDBName,
        "rds": this.state.captureRDSInstance,
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
        that.displayAllCaptures()
      })
      .fail(function (data) {
        that.handleShowAlert()
      })

  }

  // Consumes a capture name, capture db, and action and calls that action on the specified capture
  editCapture(captureName, captureDB, action) {
    this.props.dispatch(stopCapture())
    let postData = {
      "db": captureDB,
      "captureName": captureName
    }
    let that = this;
    if (action === 'end' || action === 'cancel') {
      jquery.ajax({
        url: window.location.href + 'capture/' + action,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function (data) {
        //console.log(data)
        that.displayAllCaptures()
      })
    }
    else if (action == 'REPLAY') {
      this.props.dispatch(changeStateForComponents("onReplay"))
    }
    else {
      let deleteData = {
        "capture": captureName
      }
      jquery.ajax({
        url: window.location.href + 'capture/delete',
        type: 'DELETE',
        data: JSON.stringify(deleteData),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function (data) {
        that.displayAllCaptures()
      })

    }

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
    let dbInstances = data["databases"];
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

  // Retrieves a list of available rds instances and initializes the form to choose the instances
  loadDatabaseInstances() {
    let that = this;
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
      that.setState({ captureRDSInstance: returnList[0].props.value })
    })
  }

  // Changes the selected rds instance for capture
  updateCaptureRDS(e) {
    this.setState({ captureRDSInstance: e.target.value });
  }

  // Consumes a list of capture details and a capture state and produces a button of action 
  getCapturesTable(data, captureState) {
    let currentCaptures = [];
    let current;
    let captureEditAction;
    let that = this;
    function buttonFormatter(cell, row) {
      if (captureState === 'past') {
        return (
          <div className='row'>
            <Button className='btn-warning'
              onClick={() => that.editCapture(row["captureName"], row["db"], 'REPLAY')}
            >
              REPLAY
          </Button>
            <Button className='btn-danger'
              onClick={() => that.editCapture(row["captureName"], row["db"], 'delete')}
            >
              DELETE
          </Button>
          </div>
        );
      }
      else if (captureState === 'active') {
        return (
          <div className='row'>
            <Button className='btn-danger'
              onClick={() => that.editCapture(row["captureName"], row["db"], 'end')}
            >
              STOP
          </Button>
          </div>
        );
      }
      else if (captureState === 'scheduled') {
        return (
          <div className='row'>
            <Button className='btn-danger'
              onClick={() => that.editCapture(row["captureName"], row["db"], 'cancel')}
            >
              CANCEL
          </Button>
          </div>
        );
      }
    }

    console.log("DATA!!!\n", data["captures"])
    if (data["captures"].length > 0) {
      return <BootstrapTable containerStyle={ {position: 'absolute', padding: '0px 20px 20px 0px'} } search={true} multiColumnSearch={true} data={data["captures"]}>
        <TableHeaderColumn dataField='captureName' isKey>Capture Name</TableHeaderColumn>
        <TableHeaderColumn dataField='db' >Database</TableHeaderColumn>
        <TableHeaderColumn dataField='captureName'>Capture Name</TableHeaderColumn>
        <TableHeaderColumn dataField='startTime'>Start Time</TableHeaderColumn>
        <TableHeaderColumn dataField='endTime'>End Time</TableHeaderColumn>
        <TableHeaderColumn dataField='status' dataFormat={buttonFormatter}>Action</TableHeaderColumn>
      </BootstrapTable>
    }
    else {
      let tester = [{
        something: 1,
      }]
      return <BootstrapTable containerStyle={ {position: 'absolute', padding: '0px 20px 20px 0px'} } bodyStyle={ {overflow: 'auto'} } data={[]} search={true} multiColumnSearch={true} >
        <TableHeaderColumn isKey={true} dataField='something'>Capture Name</TableHeaderColumn>
        <TableHeaderColumn >Database</TableHeaderColumn>
        <TableHeaderColumn >Capture Name</TableHeaderColumn>
        <TableHeaderColumn >Start Time</TableHeaderColumn>
        <TableHeaderColumn >End Time</TableHeaderColumn>
        <TableHeaderColumn >Action</TableHeaderColumn>

      </BootstrapTable>
    }
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
      let resultList = that.getCapturesTable(data, captureType)
      if (captureType === 'active') {
        that.props.dispatch(setCaptureCount(data.captures.length))
        console.log('SETTING THE ACTIVES')
        that.setState({ activeCaptureList: resultList })
      }
      else if (captureType === 'scheduled') {
        console.log('SETTING THE SCHEDULED')
        that.setState({ scheduledCaptureList: resultList })
      }
      else {
        console.log('SETTING THE COMPLETED')
        that.setState({ completedCaptureList: resultList })
      }
    })
  }

  // Creates the tables for all capture types
  displayAllCaptures() {
    this.displayCaptures('active')
    this.displayCaptures('scheduled')
    this.displayCaptures('past')
  }

  render() {
    let captureScheduler = null;
    let that = this; 
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
        <p>
          Looks like the capture name you provided is not unique.
          Please provide a unique capture name.
        </p>
        <p>
          <Button onClick={this.handleCloseAlert}>Hide Alert</Button>
        </p>
      </Alert>
    }


    return (
      <div>
        <div>
          <div id="captureTitle">
            <h3 style={{ marginLeft: '20px' }}>Capture</h3>
          </div>

          <div id="newCaptureBtnContainer">
            <Button
              id="newCaptureBtn"
              //style={{ marginLeft: '' }}
              bsSize="xsmall"
              bsStyle="primary"
              onClick={this.handleShow}
            >
              New Capture
            </Button>
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
                  {this.state.databaseInstanceOptions}
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

        <br />

        <div id="captureBody">
          {uniqueNameAlert}

          <CaptureList
            activeCaptures={this.state.activeCaptureList}
            completedCaptures={this.state.completedCaptureList}
            scheduledCaptures={this.state.scheduledCaptureList} />
        </div>
      </div >
    )
  }
}

const mapStateToProps = state => ({
  activeCaptures: state.activeCaptures,
  capture: state.capture
})

export default connect(mapStateToProps)(Capture)
