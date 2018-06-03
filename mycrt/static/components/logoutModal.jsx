import React, { Component } from 'react'
import { FieldGroup, Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'
import jquery from 'jquery'

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
        bsSize="lg"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row">
            <div className="col-xs-6">
              <span>Change Time Zone</span>
            </div>
            <div className="col-xs-6 float-right">
              <Button bsStyle="info" onClick={this.submit} type="submit">Change Time </Button>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <span id="contained-modal-title-sm">Would you like to logout?</span>
            </div>
            <div className="col-xs-6 float-right">
              <Button bsStyle="info" onClick={this.submit} type="submit">Yes</Button>
            </div>
          </div>
          {/*<div>
            <h2>Change Time Zone</h2>
            <Button bsStyle="info" onClick={this.submit} type="submit">Change Time </Button>
          </div>
          <div>
            <Button bsStyle="info" onClick={this.submit} type="submit">Yes</Button>
          </div>*/}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>


    );
  }
}
