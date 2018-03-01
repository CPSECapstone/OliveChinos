import React, { Component } from 'react'
import { setDataPointsForGraph } from '../actions'
import Async from 'react-promise'
import alasql from 'alasql';
import {
  LineChart,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ReferenceArea
} from 'recharts'
import { connect } from 'react-redux'

class Graph extends Component {
  constructor(props) {
    super(props)
    let valueArray = this.getValues();
    this.state = {
      xLabel: '',
      yLabel: '',
      metric: this.props.metricForGraph,
      selectedData: this.props.selectedData,
      title: '',
      minValues: ' ',
      maxValues: '',
      changableMin: '',
      changableMax: '',
      refAreaLeft: '',
      refAreaRight: '',
      top : 'dataMax+1',
      bottom : 'dataMin-1',
      top2 : 'dataMax+20',
      bottom2 : 'dataMin-20',
      animation : true,
      leftRange: '',
      rightRange: '',
      reset: '',
      values: valueArray,
      dataPointsForGraph: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.props = nextProps;
      this.getAssignments(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, this.props.currentCaptureForGraph);
    }
  }


//function that is called from the graph component, it passes in all of the currently selected
//values and then creates the data JSON to be graphed and stores it in the dataPointsForGraph redux state
getAssignments(booleanArray, totalNames, metric, analytics, dataPoints, captureName) {
  let newLinesToGraph = []
  let arrayOfDataJSONS = dataPoints;
  for (let i = 0; i < booleanArray.length; i++) {
    if (booleanArray[i]) {
      newLinesToGraph.push(totalNames[i])
    }
  }
  let numberOfSelectedReplays = newLinesToGraph.length
  if (analytics != false) {
    let totalNumberOfOptionsToChooseFrom = totalNames.length
    if ((numberOfSelectedReplays <= totalNumberOfOptionsToChooseFrom) && (numberOfSelectedReplays > 0)) {
      let uniqueName = newLinesToGraph[0]
      let firstJSON = this.getSpecifiedMetricData(booleanArray, totalNames, metric, newLinesToGraph.length, analytics, dataPoints, uniqueName, captureName)
      arrayOfDataJSONS = [numberOfSelectedReplays]
      arrayOfDataJSONS[0] = firstJSON
      for(let i = 1; i < numberOfSelectedReplays; i++) {
        uniqueName = newLinesToGraph[i]
        arrayOfDataJSONS[i] = this.getSpecifiedMetricData(booleanArray, totalNames, metric, newLinesToGraph.length, analytics, arrayOfDataJSONS[i - 1], uniqueName, captureName)
      }
    }
  }
if(arrayOfDataJSONS == undefined || arrayOfDataJSONS == false) {
  this.setState({
    dataPointsForGraph: false
  })
}
else {
  this.setState({
    dataPointsForGraph: arrayOfDataJSONS[arrayOfDataJSONS.length - 1]
  })
}
}

getSpecifiedMetricData(booleanArray, totalNames, metric, numLines, analytics, dataPoints, uniqueName, captureName) {
let currMetric = metric;
let listOfAnalytics = analytics[captureName];
if (booleanArray != false && currMetric != false) {
  for (let outer = 0; outer < booleanArray.length; outer++) {
    let pointsValues = []
    if (booleanArray[outer]) {
      let currIndex = `${uniqueName}`
      for (let i = 0; i < listOfAnalytics[currIndex][currMetric].length; i++) {
        let currPoint = { seconds: `${i}` }
        currPoint[uniqueName] = listOfAnalytics[currIndex][currMetric][i].Average
        pointsValues.push(currPoint)
      }
      if(dataPoints != false && dataPoints != undefined ) {
        return this.updateFinalJSONObject(pointsValues, numLines, dataPoints, captureName)
      }
      else {
        return pointsValues
      }
    }
  }
}
}

updateFinalJSONObject(newJsonElement, numLines, dataPoints, captureName) {
if (numLines > 0) {
  let oldJsonElement = dataPoints;
  alasql.fn.extend = alasql.utils.extend;
  var res = alasql('SELECT * FROM ? newJsonElement JOIN ? oldJsonElement USING seconds', [newJsonElement, oldJsonElement]);
  return res
}
else
  return newJsonElement
}



  getValues() {
    let values = [];
    for(let i = 0; i < this.props.booleansForGraph.length; i++) {
      if(this.props.booleansForGraph[i]) {
        // debugger;
        values.push(this.props.totalNames[i])
      }
    }
    return values;
  }

  //function to get the correct colors for the lines being graphed (feel free to change the color options in this array)
  //and return random color for each different line in the graph - max lines is 8, feel free to change that too
  getRandomColor(index) {
    let colorValues = [
      'deepskyblue',
      'lightsalmon',
      'darkolivegreen',
      'darkred',
      'blue',
      'goldenrod',
      'grey',
      'peru'
    ]
    if (this.getValues().length < 8) {
      return colorValues[index]
    } else {
      alert('Maximum Lines For Graph Reached')
      return 'white'
    }
  }

  zoomIn() {
    let { refAreaLeft, refAreaRight} = this.state;

     if ( refAreaLeft === refAreaRight || refAreaRight === '' ) {
     this.setState( () => ({
         refAreaLeft : '',
       refAreaRight : ''
     }) );
     return;
    }

    if ( refAreaLeft > refAreaRight )
    		[ refAreaLeft, refAreaRight ] = [ refAreaRight, refAreaLeft ];


         this.setState( () => ({
           refAreaLeft : '',
           refAreaRight : '',
           minValues : this.state.minValues - 400,
           maxValues : this.state.maxValues - 400,
           leftRange: refAreaLeft,
           rightRange: refAreaRight,
           reset: 'false'
         } ) );


    //var maxVal = this.state.maxValues - 400;
    //var minValues = this.state.minValues - 400;
    //this.setState({ maxValues: maxVal, minValues : minValues})
    /*
    let { refAreaLeft, refAreaRight, data } = this.state;
    if ( refAreaLeft === refAreaRight || refAreaRight === '' ) {
    	this.setState( () => ({
      	refAreaLeft : '',
        refAreaRight : ''
      }) );
    	return;
    }
    if ( refAreaLeft > refAreaRight )
    		[ refAreaLeft, refAreaRight ] = [ refAreaRight, refAreaLeft ];

    const [ bottom, top ] = getAxisYDomain( refAreaLeft, refAreaRight, 'cost', 1 );
    const [ bottom2, top2 ] = getAxisYDomain( refAreaLeft, refAreaRight, 'impression', 50 );

    this.setState({
      refAreaLeft : '',
      refAreaRight : '',
      left : refAreaLeft,
      right : refAreaRight, bottom, top, bottom2, top2,
      maxValues: this.state.maxValues - 200,
      minValues: this.state.minValues - 200
    })
    */
  }
  zoomOut() {
    //this.setState({ maxValues: 50, minValues : 50})

    this.setState({ maxValues: 0, minValues: 0 ,refAreaLeft : '',
    refAreaRight : '', reset: 'true'})
  }

  //helper function to get minimum value of current total data being graphed
  //in ordder to scale the x axis
  getMin() {
    let totalValues = []
    for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
      totalValues.push(this.state.dataPointsForGraph[i][this.props.metricForGraph])
    }
    let dataMin = totalValues.reduce(function(a, b) {
      return Math.min(a, b)
    })
    return Math.floor(dataMin)
  }

  //helper function to get maximum value of current total data being graphed
  getMax() {
    let totalValues = []
    for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
      totalValues.push(this.state.dataPointsForGraph[i][this.props.metricForGraph])
    }
    let dataMax = totalValues.reduce(function(a, b) {
      return Math.max(a, b)
    })

    return Math.ceil(dataMax)
  }

  //either graphs an empty graph if no replay or metric has been selected or
  //the lines that represent the replays that have been selected for that metric
  renderGraph() {
    //console.log(this.props);
    let hasTrue = false;
    if (this.props.booleansForGraph) {
      for (var i = 0; i < this.props.booleansForGraph.length; i++) {
        var metric = "test-metrics1";
        //setReplayCaptureAsTrueFalse
        //this.props.dispatch(setPreviousMetric(this.props.booleansForGraph[i]))
        //console.log('SUP FAM')
        //console.log(this.props.booleansForGraph)
        //this.getGraphLines()
        //this.props.funcTest(this.props.booleansForGraph[i]);

        //this is needed to see if there are any 'true' values in the boolean array to graph
        if(this.props.booleansForGraph[i]) {
          hasTrue = true;
        }
      }
    }

    //this is broken right now, ideally we want to dispatch the action to update the dataPointsForGraph in the redux
    //state ONLY IF THEY HAVE CHANGED. If they have changed, we will dispatch that action and then the data points will
    //be updated in redux, causing the graph component to rerender and use that new data to graph. Unfortunately it has
    //created an endless loop of updating the data points and rerendering so it will freeze up chrome for a minute or so if you run this.
    //I thought this would fix the problem, but it is not unfortunately, run it in the browser and check the console to see what I mean.
    // - Jessie

    if (!hasTrue) {
      return <div>{this.emptyGraph()}</div>
    } else {
      // let prevPoints = this.state.dataPointsForGraph
      // let newPoints = this.getAssignments(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, this.props.currentCaptureForGraph)
      // console.log('THE NEW POINTS TO GRAPH:', newPoints);
      // console.log('THE OLD POINTS TO GRAPH: ', prevPoints);
      // if(prevPoints == false) {
      //   console.log('DISPATCHING the action here (***first time graphing***)')
      //   this.props.dispatch(setDataPointsForGraph(newPoints));
      // }
      // else {
      //   this.setState({
      //         dataPointsForGraph: newPoints
      //   })
      //   if(JSON.stringify(newPoints) != JSON.stringify(prevPoints)) {
      //     console.log('THEY ARE NOT EQUAL, WILL DISPATCH ACTION')
      //     this.props.dispatch(setDataPointsForGraph(newPoints));
      //   }
      //   else {
      //     console.log('THEY WERE EQUAL, DIDNT DISPATCH ACTION')
      //   }
        return <div>{this.getGraphLines()}</div>
      // }
    }
  }

  //empty graph for when no replay has been selected
  emptyGraph() {
    return (
      <div>
        <div>
          <div>
            <h3 style={{ marginLeft: '20px' }} />
            <LineChart
              width={1400}
              height={400}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" domain={[0, 30]}/>
              <YAxis
                domain={[0, 10]}
                label={{ angle: -90, position: 'insideLeft' }}
              />
            </LineChart>
          </div>
        </div>
      </div>
    )
  }

  //helper function to get all of the 'line' objects to be graphed based on currently
  //selected replays and captures for graphing
  getLines() {
    let linesForGraphing = []
    for (let i = 0; i < this.props.booleansForGraph.length; i++) {
      if (this.props.booleansForGraph[i] == true) {
        let currKey = this.props.totalNames[i]
        let line = (
          <Line
            key={i}
            dataKey={currKey}
            animationDuration={300}
            stroke={this.getRandomColor(i)}
          />
        )
        linesForGraphing.push(line)
      }
    }
    return linesForGraphing
  }

  // createPromisesFromArray() {
  //   let totalResults = [];
  //   let uniqueName = false;
  //   let numLines = 0;
  //   for(let i = 0; i < this.props.booleansForGraph.length; i ++) {
  //     if(this.props.booleansForGraph[i]) {
  //       if(uniqueName == false) {
  //         uniqueName = this.props.totalNames[i]
  //       }
  //       numLines++;
  //     }
  //   }
  //   let prom = this.props.dispatch(setDataPointsForGraph(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, uniqueName,this.props.currentCaptureForGraph))
  //   for(let i = 0; i < numLines; i++) {
  //     prom = prom.then(results => {
  //       totalResults = totalResults.concat(results);
  //       return this.props.dispatch(setDataPointsForGraph(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, uniqueName,this.props.currentCaptureForGraph))
  //     })
  //   }
  //   return prom.then( results => totalResults.concat(results));
  // }


  //returns the graph with the accurate data represented by lines on the linechart
  //when there is replay data passed in from the graphContainer
  getGraphLines() {

    //COMMENTING THIS OUT RIGHT NOW TO NOT BREAK CHROME
    // this.props.dispatch(setDataPointsForGraph(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, this.props.currentCaptureForGraph));
    console.log('IN THE GET GRAPH LINES, THE DATAPOINTS ARE: ', this.state.dataPointsForGraph)
    if(this.state.dataPointsForGraph == false) {
      this.getAssignments(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, this.props.currentCaptureForGraph)
    }
      let linecharts = [];
      var jsonObject = Object.keys(this.state.dataPointsForGraph);
      var testArray = [];
      testArray = this.state.dataPointsForGraph;

      if (this.state.reset == 'true') {
      }
      else  {
      //console.log(this.state.dataPointsForGraph[1]);
        for (var i = 0; i < jsonObject.length; i++) {
          if (jsonObject[i] <= this.state.rightRange && jsonObject[i] >= this.state.leftRange) {
              testArray.push(this.state.dataPointsForGraph[i]);
          }
        }
      }
      return (
        <div>
          <div>
            <div>
              <h3 style={{ marginLeft: '20px' }}>Metric: {this.props.metricForGraph}</h3>
              <LineChart
                width={1400 - this.state.minValues}
                height={400}
                data={testArray}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                onMouseDown = { (e) => this.setState({refAreaLeft:e.activeLabel}) }
                onMouseMove = { (e) => this.state.refAreaLeft && this.setState({refAreaRight:e.activeLabel}) }
                onMouseUp = { this.zoomIn.bind( this ) }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  allowDataOverflow={false}
                  dataKey="seconds"
                  padding={{
                    left: this.state.minValues,
                    right: this.state.maxValues
                  }}
                />
                <YAxis
                  allowDataOverflow={false}
                  label={{
                    value: this.props.yLabel,
                    angle: -90,
                    position: 'insideLeft'
                  }}
                />
                <Tooltip />
                <Legend />
                {
                (this.state.refAreaLeft && this.state.refAreaRight) ? (
                  <ReferenceArea x1={this.state.refAreaLeft} x2={this.state.refAreaRight}  strokeOpacity={0.3} /> ) : null
                }
                {this.getLines().map(line => line)}
              </LineChart>
            </div>
          </div>
        </div>
      )
    // } 
  }

  render() {
    return (
      <div>
        <a
          href="javascript: void(0);"
          className="btn update"
          onClick={this.zoomOut.bind(this)}
        >
          {' '}
          Reset
        </a>
        <a
          href="javascript: void(0);"
          className="btn update"
          onClick={this.zoomIn.bind(this)}
        >
          {' '}
          Zoom In
        </a>
        {this.renderGraph()}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  booleansForGraph: state.booleansForGraph,
  totalNames: state.totalNames,
  setPreviousMetric: state.setPreviousMetric,
  metricForGraph: state.metricForGraph,
  // dataPointsForGraph: state.dataPointsForGraph,
  currentCaptureForGraph: state.currentCaptureForGraph,
  analyticsForGraph: state.analyticsForGraph,
  totalNames: state.totalNames

})

export default connect(mapStateToProps)(Graph)
