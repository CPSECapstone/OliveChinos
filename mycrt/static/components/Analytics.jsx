import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';
import LineChart from 'react-linechart';
import Graph from './Graph';
import '../node_modules/react-linechart/dist/styles.css';

// var $ = require(jquery);

/* Use this element as a reference when creating components*/

export default class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {
      analytics: 'No Analytics to show',
      ButtonText: 'Get Analytics'
    };

  //binding required for callback
    this.getPythonAnalytics = this.getPythonAnalytics.bind(this);
}



getPythonAnalytics() {

  jquery.get(window.location.href + 'analytics', (data) => {
    this.setState({analytics: data});
  });
  this.setState({ButtonText: 'Recieved Analytics'})
  
}

getJSONAnalytics() {
  if(this.state.analytics == 'No Analytics to show') {
    return
  }
  else {
    return(
      <div>
        <div className='row'>
          <p style={{marginLeft:'20px'}}><b>Database Name:</b> "{this.state.analytics.db_id}"</p>
          <p style={{marginLeft:'20px'}}><b>Replay Start Time:</b> {this.state.analytics.start_time}</p>
          <p style={{marginLeft:'20px'}}><b>Replay End Time:</b> {this.state.analytics.end_time}</p>
        </div>
      <h4 style={{marginLeft:'20px', border:'1px solid'}}>
      <div style={{overflowY:'scroll', height:'18vh'}}>
        <pre>{JSON.stringify(this.state.analytics, null, 2)}</pre>
      </div>
      </h4>
      </div>
    );
  }
}

renderCPUUtilizationGraph() {
  if(this.state.analytics!= 'No Analytics to show') {
    return (
      <Graph value='CPUUtilization' analytics={this.state.analytics} xLabel="Time" yLabel="CPU Utilization"/>
    );
  }
}

renderFreeableMemoryGraph() {
  if(this.state.analytics!= 'No Analytics to show') {
    return (
      <Graph value='FreeableMemory' analytics={this.state.analytics} xLabel="Time" yLabel="Freeable Memory"/>
    );
  }
}

renderWriteIOPSGraph() {
  if(this.state.analytics!= 'No Analytics to show') {
    return (
      <Graph value='WriteIOPS' analytics={this.state.analytics} xLabel="Time" yLabel="Write IOPS"/>
    );
  }
}

  render () {
    console.log('this is the JSON: ', this.state.testJSON)
    return (
      <div>
        <hr/>
        <Button style={{marginLeft:'20px'}} bsSize="large" bsStyle="info" onClick={this.getPythonAnalytics}>
          {this.state.ButtonText}
        </Button>
        <hr/>
        
        <div style={{height:'75vh', overflowY:'scroll'}}>
        <div>
          {this.renderCPUUtilizationGraph()}
          </div>
          <hr/>
          <div>
          {this.renderFreeableMemoryGraph()}
          </div>
          <hr/>
          <div>
          {this.renderWriteIOPSGraph()}
          </div>
          <hr/>
          {this.getJSONAnalytics()}
        </div>
      </div>
    );
  }
}
