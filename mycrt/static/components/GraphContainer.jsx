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
      keys: 'none'
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
  console.log('SETTING METRIC FOR GRAPH');
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
  let pointsValues = []
  let values
  let dataMin = 0
  let dataMax = 0
  let listOfAnalytics = this.getReplayDataArray();
  let listOfCurrentPoints;
  if(this.state.listOfTotalPointsForGraph == 'none') {
    listOfCurrentPoints = []
  }
  else {
    listOfCurrentPoints = this.state.listOfTotalPointsForGraph;
  }
  if(this.state.valuesForGraph == 'none') {
    values = []
  }
  else {
    values = this.state.valuesForGraph
  }
  // debugger;
  let currKeys = []
  if(this.state.keys != 'none') {
    currKeys = this.state.keys
  }
  let metricNum = this.state.numLinesForGraphing
  let yVariable = `cpuUtilization${metricNum}`
  if(listOfAnalytics != undefined) {
    if(this.state.metricForGraph == 'CPUUtilization') {
      currKeys.push(yVariable)
      this.setState({keys: currKeys})
        for (var outer = 0; outer < listOfAnalytics.length; outer++ ) {
            let pointsValues = []
            for(let i = 0; i < listOfAnalytics[outer][this.state.metricForGraph].length; i++) {
                let currPoint = {seconds: `${i}`}
                currPoint[yVariable] = listOfAnalytics[outer][this.state.metricForGraph][i].Average
                values.push(listOfAnalytics[outer][this.state.metricForGraph][i].Average)
                pointsValues.push(currPoint)
                console.log('this is points values: ', pointsValues)
            }
            console.log('points values is outside one for: ', pointsValues)
            if(this.state.numLinesForGraphing < 2) {
              console.log('setting state to this: **** OKAY WTF ****', pointsValues)
              this.setState({listOfTotalPointsForGraph: pointsValues})
            }
            else {
            // this.setState({listOfTotalPointsForGraph: pointsValues},
              this.updateFinalJSONObject(pointsValues)
            }

            // listOfCurrentPoints.push(pointsValues)
          }

          console.log('points values is outside both fors: ', pointsValues)
          this.setState({xLabel: 'seconds'})
          this.setState({yLabel: 'cpuUtilization'})
          
    }

    this.setState({valuesForGraph: values})
    console.log('**** THE NUMBER OF LINES TO GRAPH IS: ***', this.state.numLinesForGraphing)
  }
  
}

updateFinalJSONObject(newJsonElement) {
  if(this.state.numLinesForGraphing > 1) {
    console.log('**** OKAY PAY ATTENTION HERE ***')
    let oldJsonElement = this.state.listOfTotalPointsForGraph;
    console.log('what Im working with: ', this.oldJsonElement)
    if(this.state.listOfTotalPointsForGraph != 'none') {
      alasql.fn.extend = alasql.utils.extend;
      var res = alasql('SELECT * FROM ? newJsonElement JOIN ? oldJsonElement USING seconds', [newJsonElement, oldJsonElement]);
      // var res1 = alasql('SELECT COLUMN extend(arr1._,arr2._) FROM ? arr1 JOIN ? arr2 USING id', [arr1,arr2]);
      // console.log('this is the result!', res)
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
  let currReplays = []
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
  console.log('***HERE IS MY SANITY CHECK!!***')
  console.log('In graph container: metric for graph state - ', this.state.metricForGraph)
  console.log('In graph container: Total list of points for graph - ', this.state.listOfTotalPointsForGraph)
  console.log('In graph container: list of values for graph ', this.state.valuesForGraph)
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
