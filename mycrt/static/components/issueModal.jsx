import React, { Component } from 'react'
import { FieldGroup, Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'
import jquery from 'jquery'

export default class IssueModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
          version: '',
          issueType: '',
          issuePriority: '',
          issueTitle: '',
          description: '',
          email: ''

        }

        this.handleVersionChange = this.handleVersionChange.bind(this)
        this.updateIssueType = this.updateIssueType.bind(this)
        this.updateIssuePriority = this.updateIssuePriority.bind(this)
        this.updateIssueTitle = this.updateIssueTitle.bind(this)
        this.updateDescription = this.updateDescription.bind(this)
        this.submit = this.submit.bind(this)

    }

  handleVersionChange(event) {
    this.setState({ version: event.target.value });
  }

  updateIssueType(event) {
    this.setState({ issueType: event.target.value });
  }

  updateIssuePriority(event) {
    this.setState({ issuePriority: event.target.value });
  }

  updateIssueTitle(event) {
    this.setState({ issueTitle: event.target.value });
  }

  updateDescription(event) {
    this.setState({ description: event.target.value});
  }

  submit(event) {
    console.log('SUBMIT BUTTON WAS PRESSED!!!');
    var issueJSON = {
      "version": this.state.version,
      "type": this.state.issueType,
      "priority": this.state.issuePriority,
      "title": this.state.issueTitle,
      "description": this.state.description,
    }
    console.log("BLAHHHH", issueJSON);
    jquery.ajax({
      url: window.location.href + 'issueReport',
      type: 'POST',
      data: JSON.stringify(issueJSON),
      contentType: 'application/json',
      dataType: 'json'
    })
    this.props.onHide()
  }

    render() {
      return (
        <Modal
          {...this.props}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">Submit an Issue</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
               <FormGroup
                controlId="formBasicText"
              >
                <ControlLabel>Version 0.0.1</ControlLabel>
              </FormGroup>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Category</ControlLabel>
                <FormControl componentClass="select" placeholder="bug" onChange={this.updateIssueType}>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="support">Support/Help Request</option>
                </FormControl>
              </FormGroup>
              
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Priority</ControlLabel>
                <FormControl componentClass="select" placeholder="critical" value={this.state.issuePriority} onChange={this.updateIssuePriority}>
                  <option value="critical">Critical</option>
                  <option value="normal">Normal</option>
                  <option value="minor">Minor</option>
                </FormControl>
              </FormGroup>
              
              <FormGroup
                controlId="formBasicText"
              >
                <ControlLabel>Issue Title</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.issueTitle}
                  placeholder="A descriptive heading for the issue"
                  onChange={this.updateIssueTitle}
                />
              </FormGroup>
              
              <FormGroup controlId="formControlsTextarea" 
                onChange={this.updateDescription}>
                <ControlLabel>Description</ControlLabel>
                <FormControl componentClass="textarea" placeholder="Describe the issue with as much detail as you can provide." />
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" onClick={this.submit} type="submit">Submit</Button>
            <Button onClick={this.props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      );
    }
  }
  