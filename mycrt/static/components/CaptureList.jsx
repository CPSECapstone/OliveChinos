import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import '../styles/captureliststyles.css'
import '../styles/capturestyles.css'
import '../styles/loader.css'
import CaptureTransactionsModal from './CaptureTransactionsModal'
import { connect } from 'react-redux'
import { editCapture, setDisplayCaptureTransactionsModal } from '../actions'
import { ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'


class CaptureList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captureType: 'Active'
    }
    this.handleCaptureTypeChange = this.handleCaptureTypeChange.bind(this);
    this.handleShowCaptureTransactionsModal = this.handleShowCaptureTransactionsModal.bind(this);
  }

  handleShowCaptureTransactionsModal(data) {
    let captureName = data['captureName'];
    this.props.dispatch(setDisplayCaptureTransactionsModal(true, { capture: captureName }));
  }


  handleCaptureTypeChange(event) {
    this.setState({ captureType: event })
  }


  formatTimeZone(data) {
    for (var i = 0; i < data.length; i++) {
      var temp = new Date(data[i].endTime)
      //console.log(temp.)
    }
  }


  renderCapturesTable(data, captureState) {
    let currentCaptures = [];
    let current;
    let captureEditAction;
    let that = this;
    function buttonFormatter(cell, row) {
      if (captureState === 'completed') {
        return (
          <div className='row'>
            <Button className='replayCaptureBtn btn-warning' title='Replay this Capture'
              onClick={() => that.props.dispatch(editCapture(row["captureName"], row["db"], 'REPLAY'))}
            >
              <span className="glyphicon glyphicon-repeat"></span>
            </Button>
            <Button className='deleteCaptureBtn btn-danger' title='Delete this Capture' style={{ marginLeft: '10px' }}
              onClick={() => that.props.dispatch(editCapture(row["captureName"], row["db"], 'delete'))}
            >
              <span className="glyphicon glyphicon-trash"></span>
            </Button>
            <Button className='viewTransactionBtn btn-info' title='View Captured Transactions' style={{ marginLeft: '10px' }}
              onClick={() => that.handleShowCaptureTransactionsModal(row)}
            >
              <span className="glyphicon glyphicon-eye-open"></span>
            </Button>
          </div>
        );
      }
      else if (captureState === 'active') {
        return (
          <div className='row'>
            <Button className='stopActiveCapBtn btn-danger'
              onClick={() => that.props.dispatch(editCapture(row["captureName"], row["db"], 'end'))}
            >
              STOP
            </Button>
          </div>
        );
      }
      else if (captureState === 'active') {
        return (
          <div className='row'>
            <Button className='btn-danger'
              onClick={() => that.props.dispatch(editCapture(row["captureName"], row["db"], 'end'))}
            >
              STOP
            </Button>
          </div>
        );
      }

      if (data.length > 0) {
        return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} search={true} multiColumnSearch={true} data={data}>
          <TableHeaderColumn dataField='captureName' columnTitle isKey dataSort>Capture Name</TableHeaderColumn>
          <TableHeaderColumn dataField='db' columnTitle dataSort>Database</TableHeaderColumn>
          <TableHeaderColumn dataField='rds' columnTitle dataSort>Endpoint</TableHeaderColumn>
          <TableHeaderColumn dataField='startTime' columnTitle dataSort>Start Time</TableHeaderColumn>
          <TableHeaderColumn dataField='endTime' columnTitle dataSort>End Time</TableHeaderColumn>
          <TableHeaderColumn dataField='status' dataFormat={buttonFormatter}>Action</TableHeaderColumn>
        </BootstrapTable>
      }
      else {
        return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} bodyStyle={{ overflow: 'auto' }} data={[]} search={true} multiColumnSearch={true} >
          <TableHeaderColumn isKey={true} dataField='something'>Capture Name</TableHeaderColumn>
          <TableHeaderColumn >Database</TableHeaderColumn>
          <TableHeaderColumn >Endpoint</TableHeaderColumn>
          <TableHeaderColumn >Start Time</TableHeaderColumn>
          <TableHeaderColumn >End Time</TableHeaderColumn>
          <TableHeaderColumn >Action</TableHeaderColumn>

        </BootstrapTable>
      }
    }
    // NOTE: How do you access the time in the 'data' object to change the time zone??

    if (data.length > 0) {
      console.log("CAPTURE LIST DATA:", data.length)
      this.formatTimeZone(data)
      console.log("START TIME", data[0].startTime)
      console.log("END TIME", data[1].endTime)
      return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} search={true} multiColumnSearch={true} data={data}>
        <TableHeaderColumn dataField='captureName' columnTitle isKey dataSort>Capture Name</TableHeaderColumn>
        <TableHeaderColumn dataField='db' columnTitle dataSort>Database</TableHeaderColumn>
        <TableHeaderColumn dataField='rds' columnTitle dataSort>RDS Instance</TableHeaderColumn>
        <TableHeaderColumn dataField='startTime' columnTitle dataSort>Start Time</TableHeaderColumn>
        <TableHeaderColumn dataField='endTime' columnTitle dataSort>End Time</TableHeaderColumn>
        <TableHeaderColumn dataField='status' dataFormat={buttonFormatter}>Action</TableHeaderColumn>
      </BootstrapTable>
    }
    else {
      return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} bodyStyle={{ overflow: 'auto' }} data={[]} search={true} multiColumnSearch={true} >
        <TableHeaderColumn isKey={true} dataField='something'>Capture Name</TableHeaderColumn>
        <TableHeaderColumn >Database</TableHeaderColumn>
        <TableHeaderColumn >RDS Instance</TableHeaderColumn>
        <TableHeaderColumn >Start Time</TableHeaderColumn>
        <TableHeaderColumn >End Time</TableHeaderColumn>
        <TableHeaderColumn >Action</TableHeaderColumn>

      </BootstrapTable>
    }
  }

  renderRadioButtons() {
    return (
      <ButtonToolbar className="buttonToolbar">
        <ToggleButtonGroup id="captureTypeToggleBtn" type="radio" name="options" value={this.state.captureType} onChange={this.handleCaptureTypeChange}>
          <ToggleButton className="toggleButton" id="toggle" value='Active' >
            Active
                </ToggleButton>
          <ToggleButton className="toggleButton" id="toggle" value='Scheduled' >
            Scheduled
                </ToggleButton>
          <ToggleButton className="toggleButton" id="toggle" value='Completed' >
            Completed
                </ToggleButton>
        </ToggleButtonGroup>
      </ButtonToolbar>
    )
  }

  renderTable() {
    console.log('THE CAPTURE TYPE IS: ', this.state.captureType)
    if (this.state.captureType == 'Active') {
      if (this.props.capturesActive === false) {
        return (
          <div>
            <div id="loader" className='col'></div>
          </div>
        )
      }
      else {
        return (
          <div>
            {this.renderCapturesTable(this.props.capturesActive, 'active')}
          </div>
        )
      }
    }
    else if (this.state.captureType == 'Scheduled') {
      if (this.props.capturesScheduled === false) {
        return (
          <div>
            <div id="loader" className='col'></div>
          </div>
        )
      }
      else {
        return (
          <div>
            {this.renderCapturesTable(this.props.capturesScheduled, 'scheduled')}
          </div>
        )
      }
    }
    else if (this.state.captureType == 'Completed') {
      if (this.props.capturesCompleted === false) {
        return (
          <div>
            <div id="loader" className='col'></div>
          </div>
        )
      }
      else {
        return (
          <div>
            {this.renderRadioButtons()}
            <CaptureTransactionsModal />
            {loader}
            {this.renderTable()}
          </div>
        )
      }
    }
    else {
      <div></div>
    }
  }
  render() {
    let loader = null;
    if (this.props.displayLoader) {
      loader = <div id="loader" className='col'></div>
    }
    return (
      <div>
        {this.renderRadioButtons()}
        {loader}
        {this.renderTable()}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  isCapturesLoaded: state.isCapturesLoaded,
  capturesActive: state.capturesActive,
  capturesCompleted: state.capturesCompleted,
  capturesScheduled: state.capturesScheduled,
  displayLoader: state.displayLoader
})

export default connect(mapStateToProps)(CaptureList)