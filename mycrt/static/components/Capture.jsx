import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'
//import { Flatpickr } from 'react-flatpickr'
import 'flatpickr/dist/themes/material_green.css'
import '../styles/capturestyles.css'
import Flatpickr from 'react-flatpickr'
import Datetime from 'react-datetime'
import { connect } from 'react-redux'
import { setCaptureCount, startCapture, stopCapture, changeStateForComponents } from '../actions'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import CaptureList from './CaptureList'

/* Use this element as a reference when creating components*/

class Capture extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      show: false,
      capture: this.props.capture,
      activeCaptures: this.props.activeCaptures,
      haveCaptureData: false,
      captureData: '',
      query: '',
      captureName: '',
      inputHelpBlock: 'Optional. If not provided, name will be generated.',
      databaseInstanceOptions: ["No instances available"],
      captureDBInstance: '',
      activeCaptureObjects: [],
      activeCaptureList: [],
      completedCaptureList: [],
      scheduledCaptureList: [],
      captureStartTime: new Date(),
      captureEndTime: new Date(),
      captureMode: 'interactive'
    }

    //binding required for callback
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.startNewCapture = this.startNewCapture.bind(this)
    this.editCapture = this.editCapture.bind(this)
    // this.getCaptures = this.getCaptures.bind(this)
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.sendQuery = this.sendQuery.bind(this)
    this.handleCaptureNameChange = this.handleCaptureNameChange.bind(this)
    this.loadDatabaseInstances = this.loadDatabaseInstances.bind(this)
    this.updateCaptureDB = this.updateCaptureDB.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseAndStartCapture = this.handleCloseAndStartCapture.bind(this)
    this.getCapturesTable = this.getCapturesTable.bind(this)

  }

  componentDidMount() {
    this.loadDatabaseInstances()
    this.displayAllCaptures()
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleCloseAndStartCapture() {
    this.startNewCapture();
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  startNewCapture() {
    this.setState({ capture: 'New Capture Started' })
    this.props.dispatch(startCapture())
    var postData;
    console.log(this.state.captureMode)
    if (this.state.captureMode === 'schedule') {
      postData = {
        "db": this.state.captureDBInstance,
        "captureName": this.state.captureName.length > 0 ? this.state.captureName : '',
        "startTime": this.state.startTime,
        "endTime": this.state.endTime
      }
    }
    else {
      postData = {
        "db": this.state.captureDBInstance,
        "captureName": this.state.captureName.length > 0 ? this.state.captureName : '',
      }
    }
    var that = this
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

      })

  }

  editCapture(captureName, captureDB, action) {
    //console.log("Capture stopped: ", captureName, " at index ", index)
    //this.setState({ capture: 'Capture Stopped' })
    //console.log('capture ended: ', captureName)
    let editAction;
    if (action === 'STOP') {
      editAction = 'end'
    }
    else if (action === 'CANCEL') {
      editAction = 'cancel'
    }
    else {
      editAction = 'delete'
    }
    this.props.dispatch(stopCapture())
    var postData = {
      "db": captureDB,
      "captureName": captureName
    }
    var that = this;
    if (action === 'STOP' || action === 'CANCEL') {
      jquery.ajax({
        url: window.location.href + 'capture/' + editAction,
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
      var deleteData = {
        "capture": captureName
      }
      jquery.ajax({
        url: window.location.href + 'capture/delete',
        type: 'DELETE',
        data: JSON.stringify(deleteData),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function (data) {
        //console.log(data)
        that.displayAllCaptures()
      })

    }

  }

  cancelCapture(captureName, captureDB) {
    var postData = {
      "db": captureDB,
      "captureName": captureName
    }
    var that = this;
    jquery.ajax({
      url: window.location.href + 'capture/end',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      //console.log(data)
      that.displayAllCaptures()
    })

  }

  renderCaptureData() {
    if (this.state.haveCaptureData == true) {
      return (
        <h4 style={{ marginLeft: '20px', border: '1px solid' }}>
          <div
            style={{ overflowY: 'scroll', height: '24vh', resize: 'vertical' }}
          >
            <pre>{JSON.stringify(this.state.captureData, null, 2)}</pre>
          </div>
        </h4>
      )
    }
  }

  getValidationState() {
    if (this.state.captureName.indexOf(' ') >= 0) {
      this.state.inputHelpBlock = 'No spaces allowed in name. Please try again';
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

  getHelpBlock() {

  }

  handleQueryChange(event) {
    this.setState({ query: event.target.value })
  }

  handleCaptureNameChange(event) {
    this.setState({ captureName: event.target.value });
  }

  handleModeChange(event) {
    this.setState({ captureMode: event })
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
      that.setState({ captureDBInstance: returnList[0].props.value })
    })
  }

  updateCaptureDB(e) {
    this.setState({ captureDBInstance: e.target.value });
  }

  sendQuery() {
    var queryJSON = {
      query: this.state.query
    }
    var returnVal = jquery.ajax({
      url: window.location.href + 'capture/executeQuery',
      type: 'POST',
      data: JSON.stringify(queryJSON),
      contentType: 'application/json',
      dataType: 'json'
    })
  }

  getCapturesTable(data, captureState) {
    var currentCaptures = [];
    var current;
    var captureEditAction;
    var that = this;
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
              onClick={() => that.editCapture(row["captureName"], row["db"], 'DELETE')}
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
              onClick={() => that.editCapture(row["captureName"], row["db"], 'STOP')}
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
              onClick={() => that.editCapture(row["captureName"], row["db"], 'CANCEL')}
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
      var tester = [{
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

    var that = this;
    jquery.ajax({
      url: window.location.href + 'capture/' + captureRoute,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      var resultList = that.getCapturesTable(data, captureType)
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

  displayAllCaptures() {
    this.displayCaptures('active')
    this.displayCaptures('scheduled')
    this.displayCaptures('past')
  }



  displayCaptureScheduler() {
    var displayForm;
    if (this.state.captureMode == 'schedule') {
      displayForm = (<FormGroup>
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
      </FormGroup>)
    }
    return displayForm
  }

  render() {
    let captureScheduler = null;
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
    if (this.state.show) {
      uniqueNameAlert = <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
        <h4>Oh snap! You got an error!</h4>
        <p>
          Change this and that and try again. Duis mollis, est non commodo
          luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
          Cras mattis consectetur purus sit amet fermentum.
            </p>
        <p>
          <Button bsStyle="danger">Take this action</Button>
          <span> or </span>
          <Button onClick={this.handleDismiss}>Hide Alert</Button>
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
                <ControlLabel>Database Instance</ControlLabel>
                <FormControl componentClass="select" placeholder="select" value={this.state.captureDBInstance} onChange={this.updateCaptureDB}>
                  {this.state.databaseInstanceOptions}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <div>
                  <ButtonToolbar>
                    <ToggleButtonGroup type="radio" name="options" value={this.state.captureMode} onChange={this.handleModeChange}>
                      <ToggleButton value={'interactive'}>Interactive Mode</ToggleButton>
                      <ToggleButton value={'schedule'}>Schedule Mode</ToggleButton>
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
