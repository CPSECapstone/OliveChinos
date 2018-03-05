import React, {Component} from 'react'
import {setDataPointsForGraph} from '../actions'
import Async from 'react-promise'
import alasql from 'alasql';
import '../styles/graphComponent.css'

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
import {connect} from 'react-redux'

class Graph extends Component {
   constructor(props) {
      super(props)
      this.state = {
         yLabel: '',
         metric: this.props.metricForGraph,
         selectedData: this.props.selectedData,
         refAreaLeft: 0,
         refAreaRight: 0,
         leftRange: 0,
         rightRange: 0,
         dataPointsForGraph: false
      }
   }

   componentWillReceiveProps(nextProps) {
      if (this.props.metricForGraph != false) {

         if (this.props != nextProps && (nextProps.currentCaptureForGraph != "Capture Options")) {
            if (this.props.metricForGraph != nextProps.metricForGraph) {
               this.props = nextProps;
               this.getAssignments(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, false, this.props.currentCaptureForGraph);

            } else {
               this.props = nextProps;
               this.getAssignments(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, this.props.currentCaptureForGraph);
            }
         }
      }
   }

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
            for (let i = 1; i < numberOfSelectedReplays; i++) {
               uniqueName = newLinesToGraph[i]
               arrayOfDataJSONS[i] = this.getSpecifiedMetricData(booleanArray, totalNames, metric, newLinesToGraph.length, analytics, arrayOfDataJSONS[i - 1], uniqueName, captureName)
            }
         }
      }
      if (arrayOfDataJSONS == undefined || arrayOfDataJSONS == false) {
         this.setState({dataPointsForGraph: false})
      } else {
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
                  let currPoint = {
                     seconds: `${i}`
                  }
                  currPoint[uniqueName] = listOfAnalytics[currIndex][currMetric][i].Average
                  pointsValues.push(currPoint)
               }
               if (dataPoints != false && dataPoints != undefined) {
                  return this.updateFinalJSONObject(pointsValues, numLines, dataPoints, captureName)
               } else {
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
      } else
         return newJsonElement
   }

   getValues() {
      let values = [];
      for (let i = 0; i < this.props.booleansForGraph.length; i++) {
         if (this.props.booleansForGraph[i]) {
            // debugger;
            values.push(this.props.totalNames[i])
         }
      }
      return values;
   }

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
      let {refAreaLeft, refAreaRight, dataPointsForGraph} = this.state;

      if (refAreaLeft === refAreaRight || refAreaRight === 0 || refAreaLeft > refAreaRight) {
         this.setState(() => ({refAreaLeft: 0, refAreaRight: 0}));
         return;
      }

      this.setState({leftRange: refAreaLeft, rightRange: refAreaRight, dataPointsForGraph: dataPointsForGraph.slice(), refAreaLeft: 0, refAreaRight: 0});
   }
   zoomOut() {
      this.setState(() => ({leftRange: this.getMin(), rightRange: this.getMax(), refAreaLeft: 0, refAreaRight: 0, dataPointsForGraph: this.state.dataPointsForGraph.slice()}));
   }

   getMin() {
      let totalValues = []

      for (let j = 0; j < this.props.totalNames.length; j++) {
         if (this.props.booleansForGraph[j] === true) {
            for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
               totalValues.push(this.state.dataPointsForGraph[i]["seconds"])
            }
         }
      }

      let dataMin = totalValues.reduce(function(a, b) {
         return Math.min(a, b)
      })

      return Math.floor(dataMin)
   }

   getMax() {
      let totalValues = []
      for (let j = 0; j < this.props.totalNames.length; j++) {
         if (this.props.booleansForGraph[j] === true) {
            for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
               totalValues.push(this.state.dataPointsForGraph[i]["seconds"])
            }
         }
      }
      let dataMax = totalValues.reduce(function(a, b) {
         return Math.max(a, b)
      })

      return Math.ceil(dataMax)
   }

   renderGraph() {
      let hasTrue = false;
      if (this.props.booleansForGraph) {
         for (var i = 0; i < this.props.booleansForGraph.length; i++) {
            var metric = "test-metrics1";
            if (this.props.booleansForGraph[i]) {
               hasTrue = true;
            }
         }
      }

      if (!hasTrue || this.props.metricForGraph == false) {
         return <div>{this.emptyGraph()}</div>
      } else {
         return <div>{this.getGraphLines()}</div>
      }
   }

   emptyGraph() {
      return (<div>
         <div>
            <div>
               <h3 style={{
                     marginLeft: '20px'
                  }}/>
               <LineChart width={1400} height={400}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="name" domain={[0, 30]}/>
                  <YAxis domain={[0, 10]} label={{
                        angle: -90,
                        position: 'insideLeft'
                     }}/>
               </LineChart>
            </div>
         </div>
      </div>)
   }

   getLines() {
      let linesForGraphing = []
      for (let i = 0; i < this.props.booleansForGraph.length; i++) {
         if (this.props.booleansForGraph[i] == true) {
            let currKey = this.props.totalNames[i]
            let line = (<Line key={i} dataKey={currKey} animationDuration={500} stroke={this.getRandomColor(i)}/>)
            linesForGraphing.push(line)
         }
      }
      return linesForGraphing
   }

   getGraphLines() {
      if (this.state.dataPointsForGraph == false) {
         this.getAssignments(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, this.props.currentCaptureForGraph)
      }
      let linecharts = [];
      var jsonObject = Object.keys(this.state.dataPointsForGraph);
      var testArray = [];
      var leftMin;
      var rightMax;
      if (this.state.leftRange == 0 && this.state.rightRange == 0) {
         testArray = this.state.dataPointsForGraph;
         leftMin = this.getMin();
         rightMax = this.getMax();
      } else {

         leftMin = parseInt(this.state.leftRange);
         rightMax = parseInt(this.state.rightRange);

         for (var i = 0; i < jsonObject.length; i++) {
            var currentPoint = this.state.dataPointsForGraph[i];
            if (currentPoint.seconds <= this.state.rightRange && currentPoint.seconds >= this.state.leftRange) {
               testArray.push(currentPoint);
            }
         }
      }

      return (
        <div id="graphContainer">
          <div>
            <div>
              <h3 style={{ marginLeft: '20px' }}>Metric: {this.props.metricForGraph}</h3>
              <LineChart
                width={1400}
                height={400}
                data={testArray}
                onMouseDown = { (e) => this.setState({refAreaLeft:e.activeLabel}) }
                onMouseMove = { (e) => this.state.refAreaLeft && this.setState({refAreaRight:e.activeLabel}) }
                onMouseUp = { this.zoomIn.bind( this ) }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  allowDataOverflow={true}
                  dataKey="seconds"
                  domain={[leftMin, rightMax]}
                  type="number"
                />
                <YAxis
                  allowDataOverflow={true}
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
              <a
                href="javascript: void(0);"
                className="btn update"
                onClick={this.zoomOut.bind(this)}
              >
                {' '}
                Reset
              </a>
            </div>
          </div>
        </div>
      )
   }

   render() {
      return (<div>
         {this.renderGraph()}
      </div>)
   }
}

const mapStateToProps = state => ({
   booleansForGraph: state.booleansForGraph,
   totalNames: state.totalNames,
   setPreviousMetric: state.setPreviousMetric,
   metricForGraph: state.metricForGraph,
   currentCaptureForGraph: state.currentCaptureForGraph,
   analyticsForGraph: state.analyticsForGraph,
   totalNames: state.totalNames

})

export default connect(mapStateToProps)(Graph)
