import React, { Component } from 'react'
import { FieldGroup, Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'
import jquery from 'jquery'
import '../styles/logoutstyles.css'


export default class IssueModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      test: '0.0.1'
    }

    this.submit = this.submit.bind(this)

  }

  submit(event) {
    console.log('SUBMIT BUTTON WAS PRESSED!!!');
    location.reload();
  }

  render() {
    return (
      <Modal
        {...this.props}
        bsSize="sm"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="settingOptionsContainer">
            {/*<div id="timeZoneContainer">
              <div id="timeZoneTitle">
                <span>Change Time Zone</span>
              </div>
              <div>
                <FormControl componentClass="select" placeholder="select" value={this.state.captureRDSInstance} onChange={this.updateCaptureRDS}>
                  <option value="select">select</option>
                  <option value="AST">Alaska Standard Time</option>
                  <option value="CST">Central Standard Time</option>
                  <option value="EST">Eastern Standard Time</option>
                  <option value="MST">Mountain Standard Time</option>
                  <option value="PST">Pacific Standard Time</option>
                  <option value="HST">Hawaii-Aleutian Standard Time</option>
                </FormControl>
              </div>
    </div>*/}
            <div id="logoutContainer">
              <div>
                <Button bsStyle="danger" onClick={this.submit} type="submit" block>Logout</Button>
              </div>
            </div>
          </div>
        </Modal.Body >

        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal >


    );
  }
}
