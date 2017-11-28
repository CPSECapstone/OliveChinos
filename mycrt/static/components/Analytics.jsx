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

  render () {
    return (
      <div>
        <hr/>
        <Button style={{marginLeft:'20px'}} bsSize="large" bsStyle="info" onClick={this.getPythonAnalytics}>
          Get Analytics
        </Button>
        <hr/>
        <h4 style={{marginLeft:'20px'}}><pre>{JSON.stringify(this.state.analytics, null, 2)}</pre></h4>
      </div>
    );
  }
}
