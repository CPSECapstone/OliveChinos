import React, { Component } from 'react'
import { FieldGroup, Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'
import jquery from 'jquery'

export default class IssueModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
          version: 'Version 0.0.2',
          issueType: 'Bug Report',
          issuePriority: 'Critical',
          issueTitle: '',
          OSType: 'Microsoft',
          browser: 'Chrome',
          description: ''
        }

        this.handleVersionChange = this.handleVersionChange.bind(this)
        this.updateIssueType = this.updateIssueType.bind(this)
        this.updateIssuePriority = this.updateIssuePriority.bind(this)
        this.updateOSType = this.updateOSType.bind(this)
        this.updateBrowser = this.updateBrowser.bind(this)
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

  updateBrowser(event) {
     this.setState({ browser: event.target.value });
     console.log('UPDATED BROWSER TO: ', event.target.value)
 }

  updateOSType(event) {
    this.setState({ OSType: event.target.value });
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
    console.log('BROWSER IS: ', this.state.browser)
    var issueJSON = {
      "version": this.state.version,
      "type": this.state.issueType,
      "priority": this.state.issuePriority,
      "os": this.state.OSType,
      "browser": this.state.browser,
      "title": this.state.issueTitle,
      "description": this.state.description,
    }

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
      console.log("HELLO YOUTUBE");
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
                <ControlLabel>{this.state.version}</ControlLabel>
              </FormGroup>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Category</ControlLabel>
                <FormControl componentClass="select" placeholder="bug" value={this.state.issueType} onChange={this.updateIssueType}>
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

              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Operating System</ControlLabel>
                <FormControl componentClass="select" placeholder="Microsoft" value={this.state.OSType} onChange={this.updateOSType}>
                  <option value="microsoft">Microsoft</option>
                  <option value="macintosh">Mac OS</option>
                  <option value="linux">Linux</option>
                  <option value="linux">other</option>
                </FormControl>
              </FormGroup>

              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Browser</ControlLabel>
                <FormControl componentClass="select" placeholder="Google Chrome" value={this.state.browser} onChange={this.updateBrowser}>
                  <option value="chrome">Google Chrome</option>
                  <option value="firefox">Firefox</option>
                  <option value="ie">Internet Explorer</option>
                  <option value="safari">Safari</option>
                  <option value="opera">Opera</option>
                  <option value="other">other</option>
                </FormControl>
              </FormGroup>

              <FormGroup
                controlId="formBasicText"
              >
                <ControlLabel>Issue Title</ControlLabel>
                <FormControl
                  type="text"
                  componentClass="textarea"
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
