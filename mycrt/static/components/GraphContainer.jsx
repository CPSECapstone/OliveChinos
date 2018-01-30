import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';
import Graph from './Graph';
import alasql from 'alasql'
require('../styles/graphstyles.css');


export default class Analytics extends React.Component {

constructor(props) {
    super(props);

    this.state = {
      analytics: 'No Analytics to show',
      ButtonText: 'Get Analytics',
      graphData: 'none',
      metricForGraph: 'none',
      listOfTotalPointsForGraph: 'none',
      valuesForGraph: 'none',
      xLabel: '',
      yLabel: '',
      numLinesForGraphing: 0,
      keys: 'none',
      replayArray: 'none'
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
    <div>
      <div className='col-xs-6' >
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
    </div>
    <div className='col-xs-6'>
      {this.renderMetricOptions()}
    </div>
  </div>
  );
}

 
selectMetricForGraph(metric, e) {
  this.setState({metricForGraph: metric},
    this.setScrapedDataForGraph
  );
}

renderMetricOptions() {
  return (
    <table className="table table-hover" style={{borderLeft:'1px solid black'}}>
      <thead className="thead-dark">
        <tr>
          <th scope="col">Select Metric (only select one)</th>
        </tr>
      </thead>
      <tbody>
      <tr>
        <td onClick={this.selectMetricForGraph.bind(this, "CPUUtilization")}>
        <input style={{margin:'10px'}}type="checkbox" className="form-check-input" id="exampleCheck1"></input>
          CPU Utilization
        </td>
      </tr>
      <tr>
        <td onClick={this.selectMetricForGraph.bind(this, "FreeableMemory")}>
        <input style={{margin:'10px'}}type="checkbox" className="form-check-input" id="exampleCheck1"></input>
          Freeable Memory
        </td>
      </tr>
      <tr>
        <td onClick={this.selectMetricForGraph.bind(this, "ReadIOPS")}>
        <input style={{margin:'10px'}}type="checkbox" className="form-check-input" id="exampleCheck1"></input>
          Read IOPS
        </td>
      </tr>
      <tr>
        <td onClick={this.selectMetricForGraph.bind(this, "WriteIOPS")}>
        <input style={{margin:'10px'}}type="checkbox" className="form-check-input" id="exampleCheck1"></input>
          Write IOPS
        </td>
      </tr>
    </tbody>
  </table>
  );
}

setScrapedDataForGraph(metricName) {
  let listOfCurrentPoints = this.state.listOfTotalPointsForGraph;
  if(this.state.listOfTotalPointsForGraph == 'none') {
    listOfCurrentPoints = []
  }
  
  let metricNum = this.state.numLinesForGraphing;
  let listofAnalytics = this.getReplayDataArray();
  if(listofAnalytics != undefined) {
    if(this.state.metricForGraph == 'CPUUtilization') {
      this.getSpecifiedMetricData("seconds", "cpuUtilization", listofAnalytics)
    }

  }
  
}

getSpecifiedMetricData(xLabel, yLabel, graphData) {
  let currKeys = []
  let yVariable = this.state.graphData[this.state.numLinesForGraphing - 1]
  let listOfAnalytics = graphData;
  let values = this.state.valuesForGraph
  if(this.state.valuesForGraph == 'none') {
    values = []
  }
  if(this.state.keys != 'none') {
    currKeys = this.state.keys
  }
  currKeys.push(yVariable)
  this.setState({keys: currKeys})
  for (var outer = 0; outer < listOfAnalytics.length; outer++ ) {
      let pointsValues = []
      for(let i = 0; i < listOfAnalytics[outer][this.state.metricForGraph].length; i++) {
          let currPoint = {seconds: `${i}`}
          currPoint[yVariable] = listOfAnalytics[outer][this.state.metricForGraph][i].Average
          values.push(listOfAnalytics[outer][this.state.metricForGraph][i].Average)
          pointsValues.push(currPoint)
      }
      if(this.state.numLinesForGraphing < 2) {
        this.setState({listOfTotalPointsForGraph: pointsValues})
      }
      else {
        this.updateFinalJSONObject(pointsValues)
      }
    }

    this.setState({xLabel: this.xlabel})
    this.setState({yLabel: this.ylabel})
    this.setState({valuesForGraph: values})
}

updateFinalJSONObject(newJsonElement) {
  if(this.state.numLinesForGraphing > 1) {
    let oldJsonElement = this.state.listOfTotalPointsForGraph;
    if(this.state.listOfTotalPointsForGraph != 'none') {
      alasql.fn.extend = alasql.utils.extend;
      var res = alasql('SELECT * FROM ? newJsonElement JOIN ? oldJsonElement USING seconds', [newJsonElement, oldJsonElement]);
      this.setState({listOfTotalPointsForGraph: res})
    }
  }
  return 'none'
  

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
          <div>
            <div className='col-xs-6' >
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
          </div>
          <div className='col-xs-6'>
              {this.renderMetricOptions()}
          </div>
        </div>
        );
    }
}

addReplayToGraph(replay, e) {
  let currReplays = this.state.graphData;
  if (this.state.graphData == "none") {
    currReplays = []
  } 
  if(!this.contains(replay, this.state.graphData)) {
      let currReplays = this.state.graphData;
  }
      currReplays.push(replay);
      this.setState({graphData: currReplays},
        this.setScrapedDataForGraph
      )
      let newLineNum = this.state.numLinesForGraphing + 1
      this.setState({numLinesForGraphing: newLineNum})
}

contains(obj, l) {
  var i = l.length;
  while (i--) {
      if (l[i] === obj) {
          return true;
      }
  }
  return false;
}

getReplayDataArray() {
  if(this.state.graphData != 'none') {
    let replayDataArray = []
    let replayNameArray = this.state.graphData
    replayNameArray.map(replayName => (
      replayDataArray.push(this.props.data["test_folder"][`${replayName}.replay`])
    ))
    return replayDataArray
  }
}

renderConfigurableGraph() {
    if(this.state.graphData!= 'none') {
        return (
          <Graph metric={this.state.metricForGraph} values={this.state.valuesForGraph} pointsArray={this.state.listOfTotalPointsForGraph} xLabel={this.state.xLabel} yLabel={this.state.yLabel} keys={this.state.keys}/>
        );
      }
}

  render () {
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
