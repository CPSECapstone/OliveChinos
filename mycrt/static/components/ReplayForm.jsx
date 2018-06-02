import React, { Component } from 'react'
import jquery from 'jquery'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert, Glyphicon } from 'react-bootstrap'
import { startReplay, setGraphDataFromReplay, setBooleansForGraph, setTotalNamesForGraph } from '../actions'
import { connect } from 'react-redux'
import { setReplay, startNewReplay, stopReplay, select, closeReplayModal, setCaptureToReplay } from '../actions'
import Flatpickr from 'react-flatpickr'
import InfoReplay from './InfoReplay'
import Datetime from 'react-datetime'
import '../styles/replaystyles.css'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../styles/loader.css';

export default class ReplayForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: this.props.show,
            alertError: null,
            replayName: '',
            inputHelpBlock: 'Optional. If not provided, name will be generated.',
            captureToReplay: '',
            replayRDSInstance: '',
            replayDBName: '',
            replayDBUsername: '',
            replayDBPassword: '',
            fastMode: true,
        }

        this.handleShow = this.handleShow.bind(this);
        this.handleReplayNameChange = this.handleReplayNameChange.bind(this);
        this.updateCaptureToReplay = this.updateCaptureToReplay.bind(this);
        this.updateReplayRDS = this.updateReplayRDS.bind(this);
        this.handleDBNameChange = this.handleDBNameChange.bind(this);
        this.handleDBUsernameChange = this.handleDBUsernameChange.bind(this);
        this.handleDBPasswordChange = this.handleDBPasswordChange.bind(this);
        this.handleModeChange = this.handleModeChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleCloseAndAddReplay = this.handleCloseAndAddReplay.bind(this);
        this.setAlertError = this.setAlertError.bind(this);
        this.handleCloseAlert = this.handleCloseAlert.bind(this);
    }

    // Function to show "New Replay" popup-form
    handleShow() {
        console.log("entering show function")
        this.setState({ showModal: true });
    }

    setAlertError(errorMessage) {
        this.setState({ alertError: errorMessage });
    }

    handleCloseAlert(errorMessage) {
        this.setState({ alertError: null });
    }

    // Function to change replay name
    handleReplayNameChange(event) {
        this.setState({ replayName: event.target.value });
    }

    // Function to update the list of captures available
    updateCaptureToReplay(e) {
        this.props.store.dispatch(setCaptureToReplay(e.target.value));
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

    // Function to change replay mode
    handleModeChange(event) {
        this.setState({ fastMode: !this.state.fastMode })
    }

    // Function to close "New Replay" popup-form
    handleClose() {
        this.props.store.dispatch(closeReplayModal())
    }

    // Function to close "New Replay" popup-form and start a new replay
    handleCloseAndAddReplay() {
        this.addReplay(this.state.replayName, this.state.captureToReplay, this.state.replayRDSInstance);
    }

    // Function to display the list of available captures to replay on
    createCapturesSelect(data) {
        console.log("CREATE Captures SELECT: ", data);
        let captures = data;
        if (!captures) {
            captures = [];
        }
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

    // Function to display the list of available DB instances
    createDBInstancesSelect(data) {
        let dbInstances = data && data["databases"];
        if (!dbInstances) {
            dbInstances = [];
        }
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


    // Function to start a new replay
    addReplay(replayName, captureName, replayDB) {
        if(this.props.fromAnalytics) {
            this.props.store.dispatch(setTotalNamesForGraph([replayName]))
            this.props.store.dispatch(setBooleansForGraph([false]))
        }
        this.setState({ replay: 'Replay Active' })
        let rdsInstance;
        if (this.state.replayRDSInstance === '') {
          rdsInstance = this.props.store.databaseInstances.databases[0];
        }
        else {
          rdsInstance = this.state.replayRDSInstance;
        }

        let postData = {
            "db": this.state.replayDBName,
            "rds": rdsInstance,
            "captureName": this.props.store.captureToReplay,
            "replayName": this.state.replayName.length > 0 ? this.state.replayName : '',
            "username": this.state.replayDBUsername,
            "password": this.state.replayDBPassword,
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
        .done(function(data) {
            console.log("closing modal");
            that.setAlertError(null);
            that.props.store.dispatch(closeReplayModal());
        })
            .fail(function (data) {
                if (data.status === 400) {
                  that.setAlertError("Looks like the capture name you provided '" + postData.captureName + "' is not unique. Please provide a unique capture name.");
                }
                else if (data.status === 403) {
                  that.setAlertError("Database name and/or username/password incorrect. Unable to connect to database: '" + postData.db + "'");
                }
                else {
                  that.setAlertError("Unknown Error");
                }
                console.log("Failed from ReplayForm.jsx");
            })
    }


    render() {
        console.log("CapturesToReplay in store: ", this.props.store.capturesToReplay);
        var captureOptions = this.createCapturesSelect(this.props.store.capturesToReplay)
        var capToReplay = this.props.store.captureToReplay;
        if (this.props.onReplayPage) {
            var capOpt = captureOptions[0] && captureOptions[0].props.value;
            if (capToReplay === false) {
                this.props.store.dispatch(setCaptureToReplay(capOpt));
            }
        }
        else {
            this.props.store.dispatch(setCaptureToReplay(this.props.captureToReplay));
            captureOptions = (<option value={this.props.captureToReplay} key={0}>{this.props.captureToReplay}</option>)
        }
        //this.setState({ captureToReplay: captureToReplay });
        let uniqueNameAlert = null;
        if (this.state.alertError !== null) {
          uniqueNameAlert = <Alert bsStyle="danger" onDismiss={this.handleCloseAlert}>
            <h4>Oh snap! You got an error!</h4>
            <p>{this.state.alertError}</p>
            <p>
              <Button onClick={this.handleCloseAlert}>Hide Alert</Button>
            </p>
          </Alert>
        }

        return (
            <Modal show={this.props.show} onHide={this.handleClose} >
                <Modal.Header closeButton>
                    <Modal.Title>New Replay</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {uniqueNameAlert}
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
                            <FormControl componentClass="select" placeholder="select" value={capToReplay} onChange={this.updateCaptureToReplay}>
                                {captureOptions}
                            </FormControl>
                        </FormGroup>
                        <FormGroup controlId="formControlsSelectRDS">
                            <ControlLabel>RDS Instance</ControlLabel>
                            <FormControl componentClass="select" placeholder="select" value={this.state.replayRDSInstance} onChange={this.updateReplayRDS}>
                                {this.createDBInstancesSelect(this.props.store.databaseInstances)}
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
            </Modal >
        )
    }
}
