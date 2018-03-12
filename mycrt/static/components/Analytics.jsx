import React, { Component } from 'react';
import jquery from 'jquery';
import { Button, PageHeader } from 'react-bootstrap';
import GraphContainer from './GraphContainer';
import { connect } from 'react-redux';
import { setAnalyticsForGraph } from '../actions'

class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {
      analytics: false,
      ButtonText: 'Get Analytics'
    };

    var analyticsData = '';
}

renderGraphContainer() {
    return <GraphContainer/>
}


  render () {
    return (
      <div>
        <div style={{height:'75vh'}}>
        <div>
          {this.renderGraphContainer()} 
          
        </div>
      </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({})

export default connect(mapStateToProps)(Analytics)
