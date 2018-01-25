import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';
import Graph from './Graph';
require('../styles/graphstyles.css');


export default class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {
      analytics: 'No Analytics to show',
      ButtonText: 'Get Analytics',
      graphData: 'none'
    };

    this.addReplayToGraph = this.addReplayToGraph.bind(this);

}

renderMetricSelector() {
  if(this.props.data == 'No analytics to show') {
    return this.renderMetricSelectorWithoutData()
  }
  else {
    return this.renderMetricSelectorWithData()
  }
}

renderMetricSelectorWithoutData() {
  return (
    <table className="table table-hover">
      <thead className="thead-dark">
        <tr>
          <th scope="col">Replay(s)</th>
        </tr>
      </thead>
      <tbody>
      <tr>Loading Replay Data...</tr>
    </tbody>
  </table>
  );
}

renderMetricSelectorWithData() {
    let replayOptions = [];
    let metricOptions = [];
    if(this.props.data != 'No analytics to show') {
        var count = Object.keys(this.props.data["test_folder"]).length;
        let currentData = this.props.data["test_folder"]
        for(let i = 1; i < (count + 1); i++) {
            let replayTitle = "test-metrics"+i
            replayOptions.push(replayTitle)
        }
        return (
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th scope="col">Replay(s)</th>
              </tr>
            </thead>
            <tbody>
            {replayOptions.map(replay => (
              <tr onClick={this.addReplayToGraph.bind(this, replay)}>
              <td key={replay}>
              <input style={{margin:'10px'}}type="checkbox" className="form-check-input" id="exampleCheck1"></input>
              {replay}
              </td>
              </tr>
            ))}
          </tbody>
        </table>
        );
    }
}

addReplayToGraph(replay, e) {
  let currReplays = []
  if(this.state.graphData != 'none') {
    currReplays = this.state.graphData;
  }
  currReplays.push(replay);
  this.setState({graphData: currReplays})
}

getMetricArray() {
  if(this.state.graphData != 'none') {
    let metricArray = []
    let replayNameArray = this.state.graphData
    replayNameArray.map(replayName => (
      metricArray.push(this.props.data["test_folder"][`${replayName}.replay`])
    ))
    return metricArray
  }
}

renderConfigurableGraph() {
    if(this.state.analytics!= 'No Analytics to show') {
        return (
          <Graph metric='CPUUtilization' selectedData={this.getMetricArray()}/>
        );
      }
}

  render () {
    console.log('this is the current replays selected: ', this.state.graphData)
    console.log('current metric array: ', this.getMetricArray())
    return (
      <div>
        <div>
          <div style={{height:'50vh', border:'1px solid black', overflowY:'scroll'}}>
          <div>
            {this.renderConfigurableGraph()}
          </div>
        </div>
        </div>
        {this.renderMetricSelector()}
      </div>
    );
  }
}
