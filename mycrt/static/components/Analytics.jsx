import React, { Component } from 'react';
import jquery from 'jquery';
import { Button, PageHeader } from 'react-bootstrap';
import GraphContainer from './GraphContainer';
// import '../node_modules/react-linechart/dist/styles.css';

// var $ = require(jquery);

/* Use this element as a reference when creating components*/

export default class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {
      analytics: 'No analytics to show',
      ButtonText: 'Get Analytics'
    };

    var analyticsData = '';
  // binding required for callback
    this.getPythonAnalytics = this.getPythonAnalytics.bind(this);
}

// getPythonAnalytics() {
//   jquery.get(window.location.href + 'analytics', (data) => {
//     console.log('Wait so here....?', data)
//     this.analyticsData = data;
//     console.log('plz worrkkk', this.analyticsData)
//     return data
//   });
// }

getPythonAnalytics() {
  jquery.get(window.location.href + 'analytics', (data) => {
    this.setState({analytics: data});
  });
  this.setState({ButtonText: 'Analytics'})
}

componentWillMount() {
  this.getPythonAnalytics();
}

componentWillReceiveProps() {
  this.getPythonAnalytics();
}


  render () {
    console.log('DOES THIS WORK..?', this.state.analytics)
    return (
      <div>
        <div style={{height:'40vh', border:'2px solid black'}}>
        <div>
          <GraphContainer data={this.state.analytics}/>
        </div>
      </div>
      </div>
    );
  }
}
