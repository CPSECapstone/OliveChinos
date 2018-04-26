import React, { Component } from 'react'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'


export default class InfoReplay extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Modal
                {...this.props}
                bsSize="large"
                aria-labelledby="contained-modal-title-lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">User Guide for the Analytics Feature</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>What Is A Replay?</h4>
                    <p>
                        A replay is a previously captured workload of a specific database instance.
                        You can use replays to run a workload on a different server with the exact same timing, concurrency, and transaction characteristics of the original workload.
                        This enables you to test the affects of a system change without affecting the production system.
                    </p>
                    <h4>To Start A Replay</h4>
                    <p>
                        <p>Click the "New Replay" button. Input a name for the replay (optional). Select the capture you would like to replay.
                    Input credentials for the database you would like to capture. Select the RDS Instance where the database. Enter the name, username, and password for that database.  <br />
                            Choose between Fast Mode Mode and Time-Based Mode.</p>
                        <p><strong>Fast Mode:</strong> Transactions stored for a capture will be replayed as fast as possible.</p>
                        <p><strong>Time-Based Mode:</strong> Transactions will be replayed with respect to the time that they occured.</p>
                        <i>Note: If no RDS instances are listed, the application may be still loading or you may still need to add RDS instances to your AWS account.</i>
                    </p>

                    <h4>To View Your Replays</h4>
                    <p>
                        You may search for replays or sort them by clicking on the column headers.
                </p>
                    <h4>To Refresh Replays</h4>
                    <p>
                        Click the "Refresh Replays" button to reload the list of replays.
                </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
