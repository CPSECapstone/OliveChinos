import React, { Component } from 'react'
import { Col, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Modal, Alert } from 'react-bootstrap'


export default class InfoAnalytics extends Component {
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
            <h4>To Start</h4>
            <p>
              Find the capture you would like to analyze in the list of your completed captures below the graph.<br/>
              <i>Note: You may also search for a capture in the search bar.</i>
            </p>
            <p>
              You will be directed to all of the replays that have been recorded for that capture.
              Click on any of them to be analyzed in the graph.
            </p>
            <p>
              Select which metric you would like to analyze from the options below the graph.
              ie) CPU Utilization
            </p>
            <h4>Zooming In And Out</h4>
            <p>
              To zoom in on a section of the graph, simply click and highlight by dragging your cursor to the right on the section
               you would like to see closer and the graph will zoom in for you. To reset the graph back to it's original zoom, click the reset
              button in the top right corner.
            </p>
            <h4>Downloading Your Graph</h4>
            <p>To download the graph, click the download button in the top right corner.
              <i><br/>Note: You must have something displayed on the graph for this button to be available.</i>
            </p>
            <p>
              You may download an svg or a JSON of the data. If your graph is zoomed in, the svg will reflect
              this zoom, but the JSON will include all data.
            </p>

            
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      );
    }
  }
  