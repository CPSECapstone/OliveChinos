import React, { Component } from 'react'
import jquery from 'jquery'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'
import { startReplay, setGraphDataFromReplay } from '../actions'
import { connect } from 'react-redux'
import { setReplay, startNewReplay, stopReplay } from '../actions'
import Flatpickr from 'react-flatpickr'
import Datetime from 'react-datetime'
import '../styles/replaystyles.css'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../styles/loader.css';

class Replay extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showAlert: false,
      show: false,
      replay: this.props.replay,
      activeReplays: this.props.activeReplays,
      replayName: '',
      inputHelpBlock: 'Optional. If not provided, name will be generated.',
      captureOptions: ["No captures available"],
      replayRDSInstance: '',
      captureToReplay: '',
      replayDBName: '',
      replayDBUsername: '',
      replayDBPassword: '',
      databaseInstanceOptions: ["No instances available"],
      completedReplayList: null,
      fastMode: true
    }

    this.handleShowAlert = this.handleShowAlert.bind(this);
    this.handleCloseAlert = this.handleCloseAlert.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.addReplay = this.addReplay.bind(this)
    this.handleReplayNameChange = this.handleReplayNameChange.bind(this)
    this.displayReplays = this.displayReplays.bind(this)
    this.loadCapturesToReplay = this.loadCapturesToReplay.bind(this)
    this.updateCaptureToReplay = this.updateCaptureToReplay.bind(this)
    this.loadDatabaseInstances = this.loadDatabaseInstances.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
    this.handleCloseAndAddReplay = this.handleCloseAndAddReplay.bind(this)
    this.updateReplayRDS = this.updateReplayRDS.bind(this)
    this.handleDBNameChange = this.handleDBNameChange.bind(this)
    this.handleDBUsernameChange = this.handleDBUsernameChange.bind(this)
    this.handleDBPasswordChange = this.handleDBPasswordChange.bind(this)

  }

  // Function to hide alert message
  handleCloseAlert() {
    this.setState({ showAlert: false });
  }

  // Function to show alert message
  handleShowAlert() {
    this.setState({ showAlert: true });
  }

  // Function to close "New Replay" popup-form
  handleClose() {
    this.setState({ show: false });
  }

  // Function to close "New Replay" popup-form and start a new replay
  handleCloseAndAddReplay() {
    this.setState({ show: false });
    this.addReplay(this.state.replayName, this.state.captureToReplay, this.state.replayRDSInstance);
  }

  // Function to show "New Replay" popup-form
  handleShow() {
    this.setState({ show: true });
  }

  // Function to refresh the list of replays
  componentDidMount() {
    this.loadDatabaseInstances()
    this.loadCapturesToReplay()
    this.displayReplays()
  }

  // Function to change replay name
  handleReplayNameChange(event) {
    this.setState({ replayName: event.target.value });
  }

  // Function to change replay mode
  handleModeChange(event) {
    this.setState({ fastMode: !this.state.fastMode })
  }

  // Function to check if capture name is valid
  getValidationState() {
    if (this.state.replayName.indexOf(' ') >= 0 || this.state.replayName.indexOf(' ') >= 0) {
      this.state.inputHelpBlock = 'No spaces or / allowed in name. Please try again';
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

  // Function to display the list of available captures to replay on
  createCapturesSelect(data) {
    let captures = data
    let captureList = [];
    for (let i = 0; i < captures.length; i++) {
      let capture_name = captures[i];
      let selectOption = (<option value={capture_name} key={i}>
        {capture_name}
      </option>)
      captureList.push(selectOption)
    }
    return captureList
  }

  // Function to fetch the list of captures available to replay on
  loadCapturesToReplay() {
    let that = this;
    jquery.ajax({
      url: window.location.href + 'capture/completed_list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      let resultList = that.createCapturesSelect(data)
      that.setState({ captureOptions: resultList })
      that.setState({ captureToReplay: resultList[0].props.value })

    })
  }

  // Function to display the list of available DB instances
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

  // Function to fetch the list of DB instances
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
      that.setState({ replayRDSInstance: returnList[0].props.value })
    })
  }

  // Function to start a new replay
  addReplay(replayName, captureName, replayDB) {
    this.setState({ replay: 'Replay Active' })
    this.props.dispatch(startNewReplay())
    let postData = {
      "db": this.state.replayDBName,
      "rds": this.state.replayRDSInstance,
      "captureName": this.state.captureToReplay,
      "replayName": this.state.replayName.length > 0 ? this.state.replayName : '',
      "username": this.state.replayDBUsername,
      "password": this.state.replayDBPassword,
      //"startTime": "now",
      "fastMode": this.state.fastMode,
      "restoreDb": false
    }
    let that = this;
    jquery.ajax({
      url: window.location.href + 'replay',
      type: 'POST',
      data: JSON.stringify(postData),
      contentType: 'application/json',
      dataType: 'json'
    })
      .done(function (data) {
        that.props.dispatch(stopReplay())
        that.displayReplays()
      })
      .fail(function (data) {
        that.handleShowAlert()
      })
  }

  // Function to update the list of captures available
  updateCaptureToReplay(e) {
    this.setState({ captureToReplay: e.target.value });
  }

  // Function to update the RDS instance
  updateReplayRDS(e) {
    this.setState({ replayRDSInstance: e.target.value });
  }

  // Function to change the name of a DB instance
  handleDBNameChange(event) {
    this.setState({ replayDBName: event.target.value })
  }

  // Function to change the name of a DB instance username
  handleDBUsernameChange(event) {
    this.setState({ replayDBUsername: event.target.value })
  }

  // Function to change the name of a DB instance password
  handleDBPasswordChange(event) {
    this.setState({ replayDBPassword: event.target.value })
  }

  // Function to handle a "analyze" button click
  analyze(captureName, replayName) {
    let bools = new Array(this.props.analyticsForGraph[captureName].length)
    let currentReplayNames = Object.keys(this.props.analyticsForGraph[captureName])
    for (let i = 0; i < Object.keys(this.props.analyticsForGraph[captureName]).length; i++) {
      let currReplay = currentReplayNames[i];
      if (currReplay == replayName) {
        bools[i] = true
      }
      else {
        bools[i] = false
      }
    }
    this.props.dispatch(setGraphDataFromReplay(bools, captureName, "CPUUtilization", "onAnalyze", Object.keys(this.props.analyticsForGraph[captureName])));
  }

  deleteReplay(captureName, replayName) {
    //Callback for deleting a replay
    let deleteData = {
      "capture": captureName,
      "replay": replayName
    }
    let that = this;
    jquery.ajax({
      url: window.location.href + 'replay/delete',
      type: 'DELETE',
      data: JSON.stringify(deleteData),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      that.displayReplays()
    })

  }

  getReplayTable(data) {
    let currentCaptures = [];
    let current;
    let captureEditAction;
    let that = this;

    let options = {
      defaultSortName: 'capture',  // default sort column name
      defaultSortOrder: 'desc'  // default sort order
    };

    function buttonFormatter(cell, row) {
      return (
        <div className='row'>
          <Button
            className='btn-info' 
            onClick={() => that.analyze(row["capture"], row["replay"])}
          >
            ANALYZE
        </Button>
          <Button
            className='btn-danger' style={{marginLeft: '10px'}}
            onClick={() => that.deleteReplay(row["capture"], row["replay"])}
          >
            DELETE
        </Button>
        </div>
      );
    }

    if (data["replays"].length > 0) {
      return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} search={true} multiColumnSearch={true} data={data["replays"]} options={options}>
        <TableHeaderColumn dataField='replay' isKey dataSort>Replay Name</TableHeaderColumn>
        <TableHeaderColumn dataField='capture' dataSort>Capture</TableHeaderColumn>
        <TableHeaderColumn dataField='db' dataSort>Database</TableHeaderColumn>
        <TableHeaderColumn dataField='mode' dataSort>Mode</TableHeaderColumn>
        <TableHeaderColumn dataField='status' dataFormat={buttonFormatter}>Action</TableHeaderColumn>
      </BootstrapTable>
    }
    else {
      return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} data={[]} search={true} multiColumnSearch={true} options={options}>
        <TableHeaderColumn isKey dataField='something'>Replay Name</TableHeaderColumn>
        <TableHeaderColumn >Capture</TableHeaderColumn>
        <TableHeaderColumn >Database</TableHeaderColumn>
        <TableHeaderColumn >Mode</TableHeaderColumn>
        <TableHeaderColumn >Action</TableHeaderColumn>

      </BootstrapTable>
    }
  }

  // Function to display the list of replays
  displayReplays() {
    let that = this;
    jquery.ajax({
      url: window.location.href + 'replay/list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      let resultList = that.getReplayTable(data)
      that.setState({ completedReplayList: resultList })
    })
  }

  // Render the refresh button to refresh the list of replays
  renderRefreshButton() {
    return (
      <Button className="refreshReplayButton" onClick={this.displayReplays}>
        <span className="glyphicon glyphicon-refresh refreshIcon"></span>
      </Button>
    )
  }

  // Function to check if replays have completed loading, if not display a loader spinner
  getReplayTableOrLoader() {
    if (this.state.completedReplayList == null) {
      return <div id="loader"></div>
    } else {
      return (
        <div>
          <div>
            {this.renderRefreshButton()}
          </div>
          {this.state.completedReplayList}
        </div>
      );
    }
  }

  render() {
    let uniqueNameAlert = null;
    if (this.state.showAlert) {
      uniqueNameAlert = <Alert bsStyle="danger" onDismiss={this.handleCloseAlert}>
        <h4>Oh snap! You got an error!</h4>
        <p>
          Looks like the replay name you provided is not unique.
          Please provide a unique replay name.
        </p>
        <p>
          <Button onClick={this.handleCloseAlert}>Hide Alert</Button>
        </p>
      </Alert>
    }

    return (
      <div>
        <div>
          <div id="replayTitle">
            <h3 style={{ marginLeft: '20px' }}>Replay</h3>
          </div>

          <div id="newReplayBtnContainer">
            <Button
              id="newReplayBtn"
              
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
              <FormGroup controlId="formControlsSelectCapture">
                <ControlLabel>Capture To Replay</ControlLabel>
                <FormControl componentClass="select" placeholder="select" value={this.state.captureToReplay} onChange={this.updateCaptureToReplay}>
                  {this.state.captureOptions}
                </FormControl>
              </FormGroup>
              <FormGroup controlId="formControlsSelectRDS">
                <ControlLabel>RDS Instance</ControlLabel>
                <FormControl componentClass="select" placeholder="select" value={this.state.replayRDSInstance} onChange={this.updateReplayRDS}>
                  {this.state.databaseInstanceOptions}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel>DB Name</ControlLabel>
                <FormControl type="text" placeholder="Enter name" value={this.state.replayDBName} onChange={this.handleDBNameChange} />
              </FormGroup>
              <FormGroup id="dbInfoForm">
                <Col className="dbInfoFormCol" sm={6}>
                  <ControlLabel>DB Username</ControlLabel>
                  <FormControl type="text" placeholder="Enter username" value={this.state.replayDBUsername} onChange={this.handleDBUsernameChange} />
                </Col>
                <Col className="dbInfoFormCol" sm={6}>
                  <ControlLabel>DB Password</ControlLabel>
                  <FormControl type="password" placeholder="Enter password" value={this.state.replayDBPassword} onChange={this.handleDBPasswordChange} />
                </Col>
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
          {uniqueNameAlert}
          <div>{this.getReplayTableOrLoader()}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeReplays: state.activeReplays,
  replay: state.replay,
  analyticsForGraph: state.analyticsForGraph
})

export default connect(mapStateToProps)(Replay)
