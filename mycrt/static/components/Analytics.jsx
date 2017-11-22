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
        <Button bsSize="large" bsStyle="danger" onClick={this.getPythonAnalytics}>
          Get Analytics
        </Button>
        <h1>{this.state.analytics}</h1>
      </div>
    );
  }
}
