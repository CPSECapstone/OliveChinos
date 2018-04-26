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
            <p>
             The analytics features allows users to visualize data surrounding completed captures and their respective metric.
             Users will be prompt to select one or many metrics (e.g. CPU Utilization), which will then be graphed. <br/>
             <br/>
              <i>Note: Users may also search for a capture in the search bar. </i>
            </p>
            <br/>
            <p>
              To zoom in on the graph, users may simply click and highlight the graph by dragging the cursor from right to left. Users may download an svg or JSON file of the data.
              If the graph is zoomed, the svg will reflect the zoom.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      );
    }
  }
