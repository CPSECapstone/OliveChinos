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
      replayArray: 'none',
      isSelectedColorArray: 'none',
      isSelectedBooleanArray: 'none'
    };

    this.addReplayToGraph = this.addReplayToGraph.bind(this);

}

//This function fills an array with colors that are darker for the 
//replay options that have been selected and lighter for those not selected
//@todo: FIX THIS FUNCTION! Need to fix the state.graphData to be accurate
//before this can be fixed.
setIsSelectedColor() {
  let selectedColorArray = this.state.isSelectedArray;
  if(selectedColorArray == 'none') {
    selectedColorArray = [] 
  }
  for(let i = 0; i < replayArray.length; i++) {
    if(this.state.graphData[i] != 'not selected') {
      selectedColorArray[i] = "#551a8b";
    }
    else {
      selectedColorArray[i] = "#000";
    }
  }
  this.setState({isSelectedColorArray: selectedColorArray})
}

//This will either render the metric table below the graph
//or it will render an empty table if the data hasn't come in yet
renderMetricSelector() {
  if(this.props.data == 'No analytics to show') {
    return this.renderMetricSelectorWithoutData()
  }
  else {
    return this.renderMetricSelectorWithData()
  }
}

//Empty metric selector for when data is still loading
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

//helper function that sets the state's current metric to the one that
//the user selected
selectMetricForGraph(metric, e) {
  this.setState({metricForGraph: metric},
    this.setScrapedDataForGraph
  );
}

//renders the four metric options always
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
        <td style={{backgroundColor: this.getbackgroundColor("CPUUtilization")}} onClick={this.selectMetricForGraph.bind(this, "CPUUtilization")}>
          CPU Utilization
        </td>
      </tr>
      <tr>
        <td style={{backgroundColor: this.getbackgroundColor("FreeableMemory")}} onClick={this.selectMetricForGraph.bind(this, "FreeableMemory")}>
          Freeable Memory
        </td>
      </tr>
      <tr>
        <td style={{backgroundColor: this.getbackgroundColor("ReadIOPS")}} onClick={this.selectMetricForGraph.bind(this, "ReadIOPS")}>
          Read IOPS
        </td>
      </tr>
      <tr>
        <td style={{backgroundColor: this.getbackgroundColor("WriteIOPS")}} onClick={this.selectMetricForGraph.bind(this, "WriteIOPS")}>
          Write IOPS
        </td>
      </tr>
    </tbody>
  </table>
  );
}

//this is a helper function to change the background color of the metric
//that has been selected for the user to see
getbackgroundColor(metricName) {
  if(this.state.metricForGraph == metricName) {
    return "#ADD8E6";
  } else {
    return "#fff";
  }
}

//this function will only do anything if the user changes the lines
//they want to be graphed - both adding or removing lines
//it will then get the specified data for the current metric and save it
//to the graphData and totalPointsForGraph state objects respectively
//to be passed into the graph component
setScrapedDataForGraph(metricName) {
  let listOfCurrentPoints = this.state.listOfTotalPointsForGraph;
  if(this.state.listOfTotalPointsForGraph == 'none') {
    listOfCurrentPoints = []
  }
  
  let metricNum = this.state.numLinesForGraphing;
  let listofAnalytics = this.getReplayDataArray();
  if(listofAnalytics != undefined) {
    let totalNumberOfReplaysToChooseFrom = Object.keys(this.props.data["test_folder"]).length;
    if(this.state.numLinesForGraphing <= totalNumberOfReplaysToChooseFrom) {
      if(this.state.metricForGraph == 'CPUUtilization') {
        this.getSpecifiedMetricData("seconds", "cpuUtilization", listofAnalytics)
      } else if (this.state.metricForGraph == 'FreeableMemory') {
        this.getSpecifiedMetricData("seconds", "FreeableMemory", listofAnalytics)
      } else if (this.state.metricForGraph == 'ReadIOPS') {
        this.getSpecifiedMetricData("seconds", "ReadIOPS", listofAnalytics)
      } else if (this.state.metricForGraph == 'WriteIOPS') {
        this.getSpecifiedMetricData("seconds", "WriteIOPS", listofAnalytics)
      }
  }
  }
  
}

//This is the helper function that will get the graph data for the specified
//replays and metric and set the state objects accordingly
getSpecifiedMetricData(xLabel, yLabel, graphData) {
  let currKeys = this.state.keys
  // let yVariable = this.state.graphData[this.state.numLinesForGraphing - 1]
  let yVariable = this.state.graphData[this.state.graphData.length - 1]
  let listOfAnalytics = graphData;
  let values = this.state.valuesForGraph
  if(this.state.valuesForGraph == 'none') {
    values = []
  }
  if(this.state.keys == 'none') {
    currKeys = []
  }
  if(this.state.graphData[this.state.numLinesForGraphing - 1] != undefined) {
    currKeys.push(this.state.graphData[this.state.numLinesForGraphing - 1])
  }
  // IF YOU FIX WHEN THIS PUSHES, USE THIS AND PASS STATE.KEYS AS A PROP INTO
  // THE GRAPH COMPONENT
  // this.setState({keys: currKeys})
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
    this.setState({valuesForGraph: values})
}

//This is a helper function that takes in all of the json objects for the data
//that is going to be graphed and does an outer merge on the JSON array so that
//there is only one JSON object total for the graph component to parse
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

//Helper function to change color of replay optionsthat are or aren't 
//selected respectively.
//THIS IS NOT FUNCTIONING CURRENTLY.
//@todo: fix this and the color selectors for the replay options
getIsSelectedColor(metricName) {
  for(let i = 0; i < this.state.graphData.length; i++) {
    if(this.state.graphData[i] === metricName) {
      return this.state.isSelectedColorArray[i]
    }
  }
}

//This function renders the current replay options that the user
//has saved in their S3 bucket and displays those options by a unique
//name or id that represents that replay 
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
                  {/* style={{backgroundColor:{this.}}} */}
                  {replayOptions.map(replay => (
                    <tr onClick={this.addReplayToGraph.bind(this, replay)}>
                    <td key={replay}>
                    {/* <input style={{margin:'10px'}}type="checkbox" className="form-check-input" id="exampleCheck1"></input> */}
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

//helper function to remove a specific element in an array
remove(array, element) {
  let newArray = [];
  var index = array.indexOf(element);
  if (index > -1) {
    return array.splice(index, 1);
  }
}

/*
@todo: Fix this function to properly modify list of graphData to reflect
only the replays that were selected and not the ones deselected
*/
addReplayToGraph(replay, e) {
  let currReplays = this.state.graphData;
  if (this.state.graphData == "none") {
    currReplays = []
  } 
  // console.log('does it contain: ', replay)
  if(this.contains(replay, this.state.graphData) == false) {
    console.log('not on the graph yet')
      // currReplays[this.state.numLinesForGraphing - 1] = replay;
      currReplays.push(replay);
      this.setState({graphData: currReplays},
        this.setScrapedDataForGraph
      )
      let newLineNum = this.state.numLinesForGraphing + 1
      this.setState({numLinesForGraphing: newLineNum})
  }
  else {
    console.log('already on the graph')
    currReplays = this.remove(currReplays, replay);
    // console.log('okay this should be correct', currReplays)
    this.setState({graphData: currReplays}, this.setScrapedDataForGraph);
    let newLineNum = this.state.numLinesForGraphing - 1
    this.setState({numLinesForGraphing: (newLineNum)})
  }      
}

//helper function to see if a list contains an object
contains(obj, l) {
  var i = l.length;
  while (i--) {
      if (l[i] === obj) {
          return true;
      }
  }
  return false;
}

//checks an array of all of the actual data points for a specified
//replay and the current metric that was selected
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

//This function renders the graph object and passes
//all specified data into it
renderConfigurableGraph() {
      //There is an error here too, sometimes it goes above what it should be allowed to
      //@todo : FIX THE NUMBER OF LINES FOR GRAPHING
      console.log('numLinesForGraphing: ', this.state.numLinesForGraphing)
        return (
          <Graph metric={this.state.metricForGraph} values={this.state.valuesForGraph} pointsArray={this.state.listOfTotalPointsForGraph} numLines={this.state.numLinesForGraphing} yLabel={this.state.yLabel} keys={this.state.graphData}/>
        );
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
