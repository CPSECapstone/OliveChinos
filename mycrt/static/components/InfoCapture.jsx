import React, { Component } from 'react'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'


export default class InfoCapture extends Component {
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
                    <Modal.Title id="contained-modal-title-lg">User Guide for the Capture Feature</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>What Is A Capture?</h4>
                    <p>
                        A capture is a logging of transactions on a database during a certain time period.
                        You can use captures to replay specific workloads on different database instances, and even view key insights on specific metrics of a workload.
                    </p>
                    <h4>To Start A Capture</h4>
                    <p>
                        <p>Click the "New Capture" button. Input a name for the capture (optional).
                        Input credentials for the database you would like to capture. Select the RDS Instance where the database to capture exists in. Enter the name, username, and password for that database.  <br />
                            Choose between Interactive Mode and Scheduled Mode.</p>
                        <p><strong>Interactive:</strong> Capture can be started and stopped manually.</p>
                        <p><strong>Scheduled:</strong> Select a start and end date & time for the capture to be performed during.</p>
                        <i>Note: If no RDS instances are listed, the application may be still loading or you may still need to add RDS instances to your AWS account.</i>
                    </p>
                    <p>
                        The progress bar in the header will indicate how many captures are currently running.
                    </p>
                    <h4>To View Your Captures</h4>
                    <p>
                        Toggle between Active, Scheduled, and Completed captures. You may search for captures or sort them by clicking on the column headers.
                    </p>
                    <h4>To Refresh Captures</h4>
                    <p>
                        Click the "Refresh Capture" button to reload the list of captures.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
