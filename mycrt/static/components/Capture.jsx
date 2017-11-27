import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';
import {connect} from 'react-redux'
import {startCapture, stopCapture} from '../actions'

/* Use this element as a reference when creating components*/

class Capture extends React.Component {

constructor(props) {
    super(props);

    this.state = {
      capture: this.props.capture,
      captureActive: this.props.captureActive
    };

  //binding required for callback
    this.startCapture = this.startCapture.bind(this);
    this.stopCapture = this.stopCapture.bind(this);
}

startCapture() {
    this.setState({capture: 'Capture Active'});
    this.props.dispatch(startCapture());
    //reference this for when we need REST endpoints
//   jquery.get(window.location.href + 'capture', (data) => {
//     this.setState({capture: data});
//   });
}

stopCapture() {
  this.setState({capture: 'Capture Inactive'});
  this.props.dispatch(stopCapture());
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

const mapStateToProps = state => ({captureActive: state.captureActive, capture: state.capture})

export default connect(mapStateToProps)(Capture)
