import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';

// var $ = require(jquery);

/* Use this element as a reference when creating components*/

export default class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {analytics: '...Loading Analytics...'};

  //binding required for callback
    this.getPythonAnalytics = this.getPythonAnalytics.bind(this);
}

getAnalytics(analytics) {
  this.setState({analytics: this.props.analytics});
}

getPythonAnalytics() {
  $.get(window.location.href + 'analytics', (data) => {  
    console.log(data);
    this.getAnalytics(data);
  });
}


  render () {
    return (
      <div>
        <h1>{this.state.analytics}</h1>
        <hr/>
        <Button bsSize="large" bsStyle="danger" onClick={this.getPythonAnalytics}>
          Get Analytics
        </Button>
      </div>
    );
  }
}
