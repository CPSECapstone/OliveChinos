import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';
import Graph from './Graph';


export default class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {
      analytics: 'No Analytics to show',
      ButtonText: 'Get Analytics'
    };

}

renderMetricSelector() {
    let metricOptions = [];
    if(this.props.data != 'No analytics to show') {
        var count = Object.keys(this.props.data["test_folder"]).length;
        let currentData = this.props.data["test_folder"]
        // let j = 2;
        // console.log('this is a tester; ', currentData["test-metrics"+j+".replay"])
        for(let i = 1; i < (count - 1); i++) {
            let replayTitle = "test-metrics"+i+".replay"
            metricOptions.push(<button className="tablinks" key={i}>{replayTitle}</button>)
        }
        return (
            <div className="tab">
                {metricOptions}
            </div>
        );
    }
}

renderConfigurableGraph() {
    console.log('IN GRAPH CONTAINER', this.props.data)
    if(this.state.analytics!= 'No Analytics to show') {
        return (
          <Graph color="steelblue" value='CPUUtilization' analytics={this.state.analytics} xLabel="Time" yLabel="Percent" title="CPU Utilization"/>
        );
      }
}

  render () {
    console.log('this is the ANALYTICS IN GRAPH CONTAINER: ', this.props.data)
    return (
      <div>
        
        <div style={{height:'75vh', overflowY:'scroll'}}>
        <div>
          {/* {this.renderConfigurableGraph()} */}
          {this.renderMetricSelector()}
        </div>
      </div>
      </div>
    );
  }
}
