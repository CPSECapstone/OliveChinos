import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem } from 'react-bootstrap'
//import { Flatpickr } from 'react-flatpickr'
import 'flatpickr/dist/themes/material_green.css'
import '../styles/capturestyles.css'
import Flatpickr from 'react-flatpickr'
import Datetime from 'react-datetime'
import { connect } from 'react-redux'
import { startCapture, stopCapture } from '../actions'
import CaptureDetail from './CaptureDetail'

/* Use this element as a reference when creating components*/

class Capture extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
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
      activeCaptureList: [null],
      startTime: new Date(),
      endTime: null,
      captureMode: 'interactive'
    }

    //binding required for callback
    this.startNewCapture = this.startNewCapture.bind(this)
    this.stopCapture = this.stopCapture.bind(this)
    this.getCaptures = this.getCaptures.bind(this)
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.sendQuery = this.sendQuery.bind(this)
    this.handleCaptureNameChange = this.handleCaptureNameChange.bind(this)
    this.loadDatabaseInstances = this.loadDatabaseInstances.bind(this)
    this.updateCaptureDB = this.updateCaptureDB.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)

  }

  componentDidMount() {
    this.loadDatabaseInstances()
    this.displayCaptures()
  }

  startNewCapture() {
    this.setState({ capture: 'New Capture Started' })
    this.props.dispatch(startCapture())
    var postData;
    if (this.state.captureMode == 'schedule') {
      postData = {
        "db": this.state.captureDBInstance,
        //"captureName": this.state.captureName.length > 0 ? this.state.captureName : '',
        "startTime": this.state.startTime,
        "endTime": this.state.endTime
      }
    }
    else {
      postData = {
        "db": this.state.captureDBInstance,
        //"captureName": this.state.captureName.length > 0 ? this.state.captureName : '',
      }
    }
    var that = this
    jquery.ajax({
      url: window.location.href + 'capture/start',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      that.displayCaptures()
    })

  }

  stopCapture(captureName, captureDB, index) {
    console.log("Capture stopped: ", captureName, " at index ", index)
    this.setState({ capture: 'Capture Stopped' })
    console.log('capture ended: ', captureName)
    this.props.dispatch(stopCapture())
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
      console.log(data)
      that.displayCaptures()
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

  getCaptures(data) {
    var currentCaptures = [];
    var current;
    console.log("DATA\n", data)
    for (var i = 0; i < data.captures.length; i++) {
      current = data.captures[i]
      console.log('capture item ', i, ": ", current.captureName)
      var that = this
      currentCaptures.push((function (current, i, that) {
        return (<ListGroupItem style={{ height: '150px' }} key={current.captureName + i}>
          <CaptureDetail
            className="captureDetail"
            captureName={current.captureName}
            captureDB={current.db}
            captureStartTime={current.startTime}
            captureEndTime={current.endTime}
            stopCapture={() => { that.stopCapture(current.captureName, current.db, i) }}
          />
        </ListGroupItem>)
      }(current, i, that)))
    }

    return <ListGroup>{currentCaptures}</ListGroup>
  }

  displayCaptures() {
    var that = this;
    jquery.ajax({
      url: window.location.href + 'capture/list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      var resultList = that.getCaptures(data)
      that.setState({ activeCaptureList: resultList })
    })
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
                value={this.state.startTime}
                onChange={date => { this.setState({ startTime }) }} /></td>
              <td><div>End Time</div>
                <Flatpickr data-enable-time
                  value={this.state.endTime}
                  onChange={date => { this.setState({ endTime }) }} /></td></tr>
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
                value={this.state.startTime}
                onChange={date => { this.setState({ date }) }} /></td>
              <td><div>End Time</div>
                <Flatpickr data-enable-time
                  value={this.state.endTime}
                  onChange={date => { this.setState({ date }) }} /></td></tr>
          </tbody>
        </table>
      </FormGroup>
    }



    return (
      <div>
        <hr />
        <div>
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
            <div>
              {captureScheduler}
            </div>
          </form>
          <Button
            style={{ marginLeft: '' }}
            bsSize="large"
            bsStyle="success"
            onClick={this.startNewCapture}
          >
            Start Capture
        </Button>
        </div>
        <hr />
        <div>
          <h4 style={{ marginLeft: '20px' }}>Active Captures</h4>
          <br />
          <div>{this.state.activeCaptureList}</div>
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
