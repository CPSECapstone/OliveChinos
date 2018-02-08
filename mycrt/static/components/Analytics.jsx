import React, { Component } from 'react';
import jquery from 'jquery';
import { Button, PageHeader } from 'react-bootstrap';
import GraphContainer from './GraphContainer';
import EmptyGraphContainer from './EmptyGraphContainer';
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
  // binding required for callback
    this.getPythonAnalytics = this.getPythonAnalytics.bind(this);
}

getPythonAnalytics() {
  jquery.get(window.location.href + 'analytics', (data) => {
    this.setState({analytics: data}, this.render);
    this.props.dispatch(setAnalyticsForGraph(data))
  });
  
}

componentWillMount() {
  this.getPythonAnalytics();
}

componentWillReceiveProps() {
  this.getPythonAnalytics();
}

renderGraphContainer() {
  if(this.state.analytics) {
    return <GraphContainer data={this.state.analytics}/>
  }
  else {
    return <EmptyGraphContainer/>
  }
}


  render () {
    return (
      <div>
        <div style={{height:'75vh', border:'1px solid black'}}>
        <div>
          {this.renderGraphContainer()} 
          
        </div>
      </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  // analyticsForGraph: state.analyticsForGraph
})

export default connect(mapStateToProps)(Analytics)
