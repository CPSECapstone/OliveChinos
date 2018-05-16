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
      console.log("WTF");
      return (
        <Modal
          {...this.props}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">Would you like to logout?</Modal.Title>
          </Modal.Header>
          <Modal.Footer>
          <Button bsStyle="info" onClick={this.submit} type="submit">Yes</Button>

 <Button onClick={this.props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>


      );
    }
  }
