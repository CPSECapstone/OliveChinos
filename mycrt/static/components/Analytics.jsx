import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';

// var $ = require(jquery);

/* Use this element as a reference when creating components*/

export default class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {analytics: 'No Analytics to show'};

  //binding required for callback
    this.getPythonAnalytics = this.getPythonAnalytics.bind(this);
}

getPythonAnalytics() {
  jquery.get(window.location.href + 'analytics', (data) => {
    this.setState({analytics: data});
  });
}

getJSONAnalytics() {
  if(this.state.analytics == 'No Analytics to show') {
    return <h4 style={{marginLeft:'20px'}}><pre>{JSON.stringify(this.state.analytics, null, 2)}</pre></h4>
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

  render () {
    return (
      <div>
        <hr/>
        <Button style={{marginLeft:'20px'}} bsSize="large" bsStyle="info" onClick={this.getPythonAnalytics}>
          Get Analytics
        </Button>
        <hr/>
        {this.getJSONAnalytics()}
      </div>
    );
  }
}
