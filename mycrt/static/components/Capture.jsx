import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';

// var $ = require(jquery);

/* Use this element as a reference when creating components*/

export default class Capture extends React.Component {

constructor(props) {
    super(props);

    this.state = {capture: 'Capture Inactive'};

  //binding required for callback
    this.startCapture = this.startCapture.bind(this);
    this.stopCapture = this.stopCapture.bind(this);
}

startCapture() {
    this.setState({capture: 'Capture Active'});
//   jquery.get(window.location.href + 'capture', (data) => {
//     this.setState({capture: data});
//   });
}

stopCapture() {
    this.setState({capture: 'Capture Inactive'});
}

  render () {
    return (
      <div>
        <hr/>
        <Button style={{marginLeft:'20px'}} bsSize="large" bsStyle="success" onClick={this.startCapture}>
          Start Capture
        </Button>
        <Button style={{marginLeft:'20px'}} bsSize="large" bsStyle="danger" onClick={this.stopCapture}>
          Stop Capture
        </Button>
        <hr/>
        <h4 style={{marginLeft:'20px'}}>{this.state.capture}</h4>
      </div>
    );
  }
}
