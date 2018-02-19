import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap'
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
      activeCaptureList: [null]
    }

    //binding required for callback
    this.startCapture = this.startCapture.bind(this)
    this.stopCapture = this.stopCapture.bind(this)
    this.getCaptures = this.getCaptures.bind(this)
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.sendQuery = this.sendQuery.bind(this)
    this.handleCaptureNameChange = this.handleCaptureNameChange.bind(this)
    this.loadDatabaseInstances = this.loadDatabaseInstances.bind(this)
    this.updateCaptureDB = this.updateCaptureDB.bind(this)
  }

  componentDidMount() {
    this.loadDatabaseInstances()
    this.displayCaptures()
  }

  startCapture() {
    this.setState({ capture: 'New Capture Started' })
    this.props.dispatch(startCapture())
    var postData;
    if (this.state.captureName.length > 0) {
      postData = {
        "db": this.state.captureDBInstance,
        "captureName": this.state.captureName
      }
    }
    else {
      postData = {
        "db": this.state.captureDBInstance,
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

  stopCapture(captureName, captureDB) {
    this.setState({ capture: 'Capture Stopped' })
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
      console.log(current.captureName)
      currentCaptures.push(
        <li key={current.captureName + i}>
          <CaptureDetail
            className="captureDetail"
            captureName={current.captureName}
            captureDB={current.db}
            captureDate={current.startTime}
            stopCapture={() => { this.stopCapture(current.captureName, current.db) }}
          />
        </li>
      )
    }
    return <ul>{currentCaptures}</ul>
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

  render() {
    return (
      <div>
        <hr />
        <form>
          <FormGroup
            //controlId="formBasicText"
            validationState={this.getValidationState()}
          >
            <ControlLabel>Capture Name</ControlLabel>
            <FormControl
              id='captureNameInput'
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
        </form>
        <Button
          style={{ marginLeft: '20px' }}
          bsSize="large"
          bsStyle="success"
          id="startCaptureButton"
          onClick={this.startCapture}
        >
          Start Capture
        </Button>
        {/*<Button
          style={{ marginLeft: '20px' }}
          bsSize="large"
          bsStyle="danger"
          onClick={this.stopCapture}
        >
          Stop Capture
        </Button>*/}
        {/*         <input
          style={{ marginLeft: '20px' }}
          onChange={this.handleQueryChange}
        />
        <Button className="btn-md" onClick={this.sendQuery}>
          Send Query
        </Button>
      */}
        <hr />
        <h4 style={{ marginLeft: '20px' }}>{this.state.capture}</h4>
        {this.renderCaptureData()}
        <div>
          <CaptureDetail
            className="captureDetail"
            captureName='Test Name'
            captureDB='current.db'
            captureDate='2/15/18'
          //stopCapture={() => { this.stopCapture(current.captureName, current.db) }}
          />
        </div>
        <br />
        <div>{this.state.activeCaptureList}</div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeCaptures: state.activeCaptures,
  capture: state.capture
})

export default connect(mapStateToProps)(Capture)
