import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';
import Graph from './Graph';
// import '../node_modules/react-linechart/dist/styles.css';

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
  this.setState({ButtonText: 'Analytics'})
  
}

getJSONAnalytics() {
  if(this.state.analytics == 'No Analytics to show') {
    return
  }
  else {
    return(
      <div>
        <div className='row'>
        <h4 style={{marginLeft:'20px'}}><u>Raw Data</u></h4>
          <p style={{marginLeft:'20px'}}><b>Database Name:</b> "{this.state.analytics.db_id}"</p>
          <p style={{marginLeft:'20px'}}><b>Replay Start Time:</b> {this.state.analytics.start_time}</p>
          <p style={{marginLeft:'20px'}}><b>Replay End Time:</b> {this.state.analytics.end_time}</p>
        </div>
      <h4 style={{marginLeft:'20px', border:'1px solid'}}>
      <div style={{overflowY:'scroll', height:'24vh', resize:'vertical'}}>
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
      <Graph color="steelblue" value='CPUUtilization' analytics={this.state.analytics} xLabel="Time" yLabel="Percent" title="CPU Utilization"/>
    );
  }
}

renderFreeableMemoryGraph() {
  if(this.state.analytics!= 'No Analytics to show') {
    return (
      <Graph color="#298256" value='FreeableMemory' analytics={this.state.analytics} xLabel="Time" yLabel="" title="Freeable Memory (Bytes)"/>
    );
  }
}

renderWriteIOPSGraph() {
  if(this.state.analytics!= 'No Analytics to show') {
    return (
      <Graph color="lightcoral" value='WriteIOPS' analytics={this.state.analytics} xLabel="Time" yLabel="Count/Second" title="Write IOPS"/>
    );
  }
}

renderReadIOPSGraph() {
  if(this.state.analytics!= 'No Analytics to show') {
    return (
      <Graph color="darkviolet" value='ReadIOPS' analytics={this.state.analytics} xLabel="Time" yLabel="Count/Second" title="Read IOPS"/>
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
          {this.renderWriteIOPSGraph()}
          {this.renderReadIOPSGraph()}
          {this.renderFreeableMemoryGraph()}
          {this.getJSONAnalytics()}
        </div>
      </div>
      </div>
    );
  }
}
