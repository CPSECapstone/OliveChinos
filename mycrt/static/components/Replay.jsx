import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal } from 'react-bootstrap'
import { startReplay, setGraphDataFromReplay } from '../actions'
import { connect } from 'react-redux'
import { setReplay, startNewReplay, stopReplay } from '../actions'
import Flatpickr from 'react-flatpickr'
import Datetime from 'react-datetime'
import '../styles/replaystyles.css'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../styles/loader.css';

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
      completedReplayList: null,
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
    this.handleCloseAndAddReplay = this.handleCloseAndAddReplay.bind(this)
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleCloseAndAddReplay() {
    this.setState({ show: false });
    // THIS IS WHAT NEEDS TO BE FIXED
    console.log('THIS IS WHAT WE ARE SENDING TO ADD REPLAY:', this.state.replayName, this.state.captureToReplay, this.state.replayDBInstance)
    this.addReplay(this.state.replayName, this.state.captureToReplay, this.state.replayDBInstance);
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

  analyze(captureName, replayName) {
    var bools = new Array(this.props.analyticsForGraph[captureName].length)
    let currentReplayNames = Object.keys(this.props.analyticsForGraph[captureName])
    for(let i = 0; i < Object.keys(this.props.analyticsForGraph[captureName]).length; i++) {
      let currReplay = currentReplayNames[i];
      if(currReplay == replayName) {
        bools[i] = true
      }
      else {
        bools[i] = false
      }
    }

    this.props.dispatch(setGraphDataFromReplay(bools, captureName, "CPUUtilization", "onAnalyze", Object.keys(this.props.analyticsForGraph[captureName])));
  }

  getReplayTable(data) {
    var currentCaptures = [];
    var current;
    var captureEditAction;
    var that = this;

    var options = {
      defaultSortName: 'capture',  // default sort column name
      defaultSortOrder: 'desc'  // default sort order
    };
    function buttonFormatter(cell, row) {
      return (
        <div className='row'>
          <Button className='btn-info btn-sm'
            onClick={() => that.analyze(row["capture"], row["replay"])}
          >
            ANALYZE
        </Button>
        </div>
      );
    }

    console.log("DATA****\n", data["replays"])
    if (data["replays"].length > 0) {
      return <BootstrapTable containerStyle={ {position: 'absolute'} } search={true} multiColumnSearch={true} data={data["replays"]} options={options}>
        <TableHeaderColumn dataField='replay' isKey>Replay Name</TableHeaderColumn>
        <TableHeaderColumn dataField='capture' dataSort>Capture</TableHeaderColumn>
        <TableHeaderColumn dataField='db'>Database</TableHeaderColumn>
        <TableHeaderColumn dataField='mode'>Mode</TableHeaderColumn>
        <TableHeaderColumn dataField='status' dataFormat={buttonFormatter}>Action</TableHeaderColumn>
      </BootstrapTable>
    }
    else {
      return <BootstrapTable containerStyle={ {position: 'absolute'} } data={[]} search={true} multiColumnSearch={true} options={options}>
        <TableHeaderColumn isKey dataField='something'>Replay Name</TableHeaderColumn>
        <TableHeaderColumn >Capture</TableHeaderColumn>
        <TableHeaderColumn >Database</TableHeaderColumn>
        <TableHeaderColumn >Mode</TableHeaderColumn>
        <TableHeaderColumn >Action</TableHeaderColumn>

      </BootstrapTable>
    }
  }

  displayReplays() {
    var that = this;
    jquery.ajax({
      url: window.location.href + 'replay/list',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      // var resultList = that.getReplays(data)
      var resultList = that.getReplayTable(data)
      that.setState({ completedReplayList: resultList })
    })
  }

  getReplayTableOrLoader() {
    if(this.state.completedReplayList == null) {
      return <div id="loader"></div>
    } else {
      return (
        <div>
          {this.state.completedReplayList}
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <div>
          <div id="replayTitle">
            <h3 style={{ marginLeft: '20px' }}>Replay</h3>
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
