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
      captureActive: this.props.captureActive,
      haveCaptureData: false,
      captureData: '',
      query: ''

    };

  //binding required for callback
    this.startCapture = this.startCapture.bind(this);
    this.stopCapture = this.stopCapture.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.sendQuery = this.sendQuery.bind(this);
  }

  startCapture() {
    this.setState({capture: 'Capture Active'});
    this.props.dispatch(startCapture());
    jquery.post(window.location.href + 'capture/start', (data) => {
      //this.setState({capture: data});
      console.log(data);
    });
  }

  stopCapture() {
    this.setState({capture: 'Capture Inactive'});
    this.props.dispatch(stopCapture());
    jquery.post(window.location.href + 'capture/end', (data) => {
      this.setState({haveCaptureData: true})
      this.setState({captureData: data})
    });
  }

  renderCaptureData() {
    if(this.state.haveCaptureData == true) {
      return (
      <h4 style={{marginLeft:'20px', border:'1px solid'}}>
      <div style={{overflowY:'scroll', height:'24vh', resize:'vertical'}}>
      <pre>{JSON.stringify(this.state.captureData, null, 2)}</pre>
      </div>
      </h4>
      );
    }
  }

  handleQueryChange(event) {
    this.setState({query: event.target.value})
  }

  sendQuery() {
    var queryJSON = {
      query: this.state.query
    }
    var returnVal = jquery.ajax({
      url: window.location.href + 'capture/executeQuery',
      type: "POST",
      data: JSON.stringify(queryJSON),
      contentType: "application/json",
      dataType: 'json',
    });
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
        <input style={{marginLeft:'20px'}} onChange={this.handleQueryChange}></input>
        <Button className='btn-md' onClick={this.sendQuery}>
          Send Query
        </Button>
        <hr/>
        <h4 style={{marginLeft:'20px'}}>{this.state.capture}</h4>
        {this.renderCaptureData()}
        
      </div>
    );
  }
}

const mapStateToProps = state => ({captureActive: state.captureActive, capture: state.capture})

export default connect(mapStateToProps)(Capture)
