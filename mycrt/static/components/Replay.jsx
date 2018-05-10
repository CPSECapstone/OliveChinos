import React, { Component } from 'react'
import jquery from 'jquery'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert, Glyphicon } from 'react-bootstrap'
import { startReplay, setGraphDataFromReplay } from '../actions'
import { connect } from 'react-redux'
import { setReplay, startNewReplay, stopReplay, select, startReplayFromCapture, fetchReplays, fetchCapturesToReplay, getAnalyticsForGraph } from '../actions'
import Flatpickr from 'react-flatpickr'
import InfoReplay from './InfoReplay'
import Datetime from 'react-datetime'
import '../styles/replaystyles.css'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../styles/loader.css';
import ReplayForm from './ReplayForm'

class Replay extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      show: false,
      showAlert: false,
      replay: this.props.replay,
      captureOptions: ["No captures available"],
      databaseInstanceOptions: ["No instances available"],
      completedReplayList: null,
      replayInfoShow: false,
      replayType: 'Active'
    }

    this.handleShow = this.handleShow.bind(this)
    this.handleShowAlert = this.handleShowAlert.bind(this)
    this.handleCloseAlert = this.handleCloseAlert.bind(this)
    this.handleRefreshButton = this.handleRefreshButton.bind(this)
    this.handleCloseAndAddReplay = this.handleCloseAndAddReplay.bind(this)
    this.handleReplayTypeChange = this.handleReplayTypeChange.bind(this)
  }


  // Function to show "New Replay" popup-form
  handleShow() {
    //this.setState({ show: true });
    this.props.dispatch(startReplayFromCapture())
  }

  // Function to hide alert message
  handleCloseAlert() {
    this.setState({ showAlert: false });
  }

  // Function to show alert message
  handleShowAlert() {
    this.setState({ showAlert: true });
  }

  handleRefreshButton() {
    this.props.dispatch(fetchReplays());
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

  // Function to change replay name
  handleReplayNameChange(event) {
    this.setState({ replayName: event.target.value });
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


  // Function to handle a "analyze" button click
  analyze(captureName, replayName) {
    console.log('DEBUGGING: capture name', captureName)
    console.log('DEBUGGING: replay name', replayName)
    console.log('analytics at ', this.props.analyticsForGraph)
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
    console.log('***** OKAY WAIT!!!! ***** ', replayName)
    this.props.dispatch(setGraphDataFromReplay(bools, captureName, "CPUUtilization", "onAnalyze", Object.keys(this.props.analyticsForGraph[captureName]), new Array(replayName)));
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
      that.props.dispatch(fetchReplays());
      that.props.dispatch(getAnalyticsForGraph());
    })

  }

  stopActiveReplay(captureName, replayName) {
    //Callback for deleting a replay
    let stopData = {
      "capture": captureName,
      "replay": replayName
    }
    let that = this;
    jquery.ajax({
      url: window.location.href + 'replay/active',
      type: 'DELETE',
      data: JSON.stringify(deleteData),
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      that.props.dispatch(fetchReplays());
    })

  }

  getReplayTable(data, rType) {
    let currentCaptures = [];
    let current;
    let captureEditAction;
    let that = this;

    let options = {
      defaultSortName: 'capture',  // default sort column name
      defaultSortOrder: 'desc'  // default sort order
    };

    function buttonFormatter(cell, row) {
      //TODO Implement STOP active replay functionality
      if (rType === 'Active') {
        return (
          <div className='row'>
            <Button
              className='btn-danger' style={{ marginLeft: '10px' }}
              onClick={() => that.stopActiveReplay(row["capture"], row["replay"])}
            >
              STOP
            </Button>
          </div>
        )
      }
      else if (rType === 'Completed') {
        return (
          <div className='row'>
            <Button
              className='btn-info'
              onClick={() => that.analyze(row["capture"], row["replay"])}
            >
              ANALYZE
          </Button>
            <Button
              className='btn-danger' style={{ marginLeft: '10px' }}
              onClick={() => that.deleteReplay(row["capture"], row["replay"])}
            >
              DELETE
          </Button>
          </div>
        );
      }
      else {
        <div></div>
      }
      
    }

    if (data.length > 0) {
      return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} search={true} multiColumnSearch={true} data={data} options={options}>
        <TableHeaderColumn dataField='replay' isKey dataSort>Replay Name</TableHeaderColumn>
        <TableHeaderColumn dataField='capture' dataSort>Capture</TableHeaderColumn>
        <TableHeaderColumn dataField='db' dataSort>Database</TableHeaderColumn>
        <TableHeaderColumn dataField='rds' dataSort>RDS Instance</TableHeaderColumn>
        <TableHeaderColumn dataField='mode' dataSort>Mode</TableHeaderColumn>
        <TableHeaderColumn dataField='status' dataFormat={buttonFormatter}>Action</TableHeaderColumn>
      </BootstrapTable>
    }
    else {
      return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} data={[]} search={true} multiColumnSearch={true} options={options}>
        <TableHeaderColumn isKey dataField='something'>Replay Name</TableHeaderColumn>
        <TableHeaderColumn >Capture</TableHeaderColumn>
        <TableHeaderColumn >Database</TableHeaderColumn>
        <TableHeaderColumn >RDS Instance</TableHeaderColumn>
        <TableHeaderColumn >Mode</TableHeaderColumn>
        <TableHeaderColumn >Action</TableHeaderColumn>

      </BootstrapTable>
    }
  }

  // Function to check if replays have completed loading, if not display a loader spinner
  getReplayTableOrLoader() {
    if (this.state.replayType == 'Active') {
      if (this.props.replaysActive === false) {
        return <div id="loader"></div>
      } else {
        return (
          <div>
            {this.getReplayTable(this.props.replaysActive, 'Active')}
          </div>
        );
      }

    }
    else if (this.state.replayType == 'Completed') {
      if (this.props.replaysCompleted === false) {
        return <div id="loader"></div>
      } else {
        return (
          <div>
            {this.getReplayTable(this.props.replaysCompleted, 'Completed')}
          </div>
        );
      }
    }
    else {
      <div />
    }
  }

  handleReplayTypeChange(event) {
    this.setState({ replayType: event })
  }

  renderRadioButtons() {
    return (
      <ButtonToolbar className="buttonToolbar">
        <ToggleButtonGroup type="radio" name="options" value={this.state.replayType} onChange={this.handleReplayTypeChange}>
          <ToggleButton className="toggleButton" id="toggle" value='Active' >
            Active
            </ToggleButton>
          <ToggleButton className="toggleButton" id="toggle" value='Completed' >
            Completed
            </ToggleButton>
        </ToggleButtonGroup>
      </ButtonToolbar>
    )
  }

  render() {
    let uniqueNameAlert = null;

    let replayInfoClose = () => this.setState({ replayInfoShow: false })
    if (this.state.showAlert) {
      uniqueNameAlert = <Alert bsStyle="danger" onDismiss={this.handleCloseAlert}>
        <h4>Oh snap! You got an error!</h4>
        <p>
          Looks like something went wrong.
          Either the replay name you provided is not unique, or your database credentials are incorrect.
          Please provide the correct information, and submit the replay form again.
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
            <h3 style={{ marginLeft: '20px' }}>Completed Replays
            <Glyphicon style={{ paddingLeft: '20px', cursor: 'pointer' }} glyph="info-sign"
                onClick={() => this.setState({ replayInfoShow: true })} /></h3>
          </div>

          <div id="newReplayBtnContainer">
            <Button
              id="refreshReplayButton"
              onClick={this.handleRefreshButton}>
              Refresh Replays
            </Button>
            <Button
              id="newReplayBtn"
              bsStyle="primary"
              onClick={this.handleShow}
            >
              New Replay
            </Button>
          </div>
        </div>

        <ReplayForm onReplayPage={true} store={this.props} show={this.props.showReplayModal} />

        <InfoReplay show={this.state.replayInfoShow} onHide={replayInfoClose} />


        <br />

        <div id="replayBody">
          <div>{this.renderRadioButtons()}</div>
          <div>{this.getReplayTableOrLoader()}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  replay: state.replay,
  analyticsForGraph: state.analyticsForGraph,
  showReplayModal: state.showReplayModal,
  databaseInstances: state.databaseInstances,
  replaysCompleted: state.replaysCompleted,
  replaysActive: state.replaysActive,
  capturesToReplay: state.capturesToReplay
})

export default connect(mapStateToProps)(Replay)
