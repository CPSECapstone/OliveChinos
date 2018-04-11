import React, {Component} from 'react'
import * as ReactDOM from 'react-dom';
import {setDataPointsForGraph} from '../actions'
import Async from 'react-promise'
import alasql from 'alasql';
import '../styles/graphComponent.css'
import FileSaver from 'file-saver'

import {
   ResponsiveContainer,
   Label,
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
import { DropdownButton, MenuItem} from 'react-bootstrap'

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

   downloadObjectAsJson(){
      var date = new Date();
      var newDate = date.toISOString().split('T')[0];
      var isoDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
      var newTime = isoDate.split('T')[1].split('.')[0];

      var exportObj = {
         "Metric": this.props.metricForGraph,
         "Date": newDate,
         "Time": newTime,
         "DataPoints": this.state.dataPointsForGraph
      }
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null , 3));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "test.json");
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
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

      if (arrayOfDataJSONS == false) {
         this.setState({dataPointsForGraph: false})
         return false;
      } else {
         this.setState({
            dataPointsForGraph: arrayOfDataJSONS[arrayOfDataJSONS.length - 1]
         })
         return arrayOfDataJSONS[arrayOfDataJSONS.length - 1];
      }
   }

   getSpecifiedMetricData(booleanArray, totalNames, metric, numLines, analytics, dataPoints, uniqueName, captureName) {
      let currMetric = metric;
      let listOfAnalytics = analytics[captureName];

      if (booleanArray !== false && currMetric !== false) {
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
               if (dataPoints !== false && dataPoints !== undefined) {
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
      } else {
         this.setState({leftRange: refAreaLeft, rightRange: refAreaRight, dataPointsForGraph: dataPointsForGraph.slice(), refAreaLeft: 0, refAreaRight: 0});
      }
   }
   zoomOut() {
      this.setState(() => ({leftRange: this.getMinXAxis(), rightRange: this.getMaxXAxis(), refAreaLeft: 0, refAreaRight: 0, dataPointsForGraph: this.state.dataPointsForGraph.slice()}));
   }

   getMinXAxis() {
      let totalValues = []

      console.log("XAXIS");
      console.log(this.props.booleansForGraph);

      for (let j = 0; j < this.props.totalNames.length; j++) {
         if (this.props.booleansForGraph[j] === true) {
            for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
               totalValues.push(this.state.dataPointsForGraph[i]["seconds"])
            }
         }
      }

      if (totalValues.length === 0) {
         return 0;
      }

      let dataMin = totalValues.reduce(function(a, b) {
         return Math.min(a, b)
      })

      return Math.floor(dataMin)
   }

   getMaxXAxis() {
      let totalValues = []
      for (let j = 0; j < this.props.totalNames.length; j++) {
         if (this.props.booleansForGraph[j] === true) {
            for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
               totalValues.push(this.state.dataPointsForGraph[i]["seconds"])
            }
         }
      }

      if (totalValues.length === 0) {
         return 0;
      }

      let dataMax = totalValues.reduce(function(a, b) {
         return Math.max(a, b)
      })

      return Math.ceil(dataMax)
   }

   getMinYAxis() {
      let totalValues = []

      for (let j = 0; j < this.props.totalNames.length; j++) {
         if (this.props.booleansForGraph[j] === true) {
            for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
               totalValues.push(this.state.dataPointsForGraph[i][this.props.totalNames[j]])
            }
         }
      }

      if (totalValues.length === 0) {
         return 0;
      }

      let dataMin = totalValues.reduce(function(a, b) {
         return Math.min(a, b)
      })

      return Math.floor(dataMin)
   }

   getMaxYAxis() {
      let totalValues = []
      for (let j = 0; j < this.props.totalNames.length; j++) {
         if (this.props.booleansForGraph[j] === true) {
            for (let i = 0; i < this.state.dataPointsForGraph.length; i++) {
               totalValues.push(this.state.dataPointsForGraph[i][this.props.totalNames[j]])
            }
         }
      }

      if (totalValues.length === 0) {
         return 0;
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
                  <ResponsiveContainer width="100%" height="40%" overflow="visible">
               <LineChart width={1400} height={400}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="name" domain={[0, 30]}/>
                  <YAxis domain={[0, 10]} label={{
                        angle: -90,
                        position: 'insideLeft'
                     }}/>
               </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>)
   }

   getLines() {
      let linesForGraphing = []
      for (let i = 0; i < this.props.booleansForGraph.length; i++) {
         if (this.props.booleansForGraph[i] == true) {
            let currKey = this.props.totalNames[i]
            let line = (<Line key={i} id="Legend" dataKey={currKey} animationDuration={500} stroke={this.getRandomColor(i)}/>)
            linesForGraphing.push(line)
         }
      }
      return linesForGraphing
   }

   exportChart(asSVG) {

       let chartSVG = ReactDOM.findDOMNode(this.currentGraph).children[0];

       if (asSVG) {
           let svgURL = new XMLSerializer().serializeToString(chartSVG);
           let svgBlob = new Blob([svgURL], {type: "image/svg+xml;charset=utf-8"});
           FileSaver.saveAs(svgBlob, "graph.svg");
       } else {
           let svgBlob = new Blob([chartSVG.outerHTML], {type: "text/html;charset=utf-8"});
           FileSaver.saveAs(svgBlob, "graph.html");
       }
   }

   getGraphLines() {

      let linecharts = [];
      var testArray = [];

      if (this.state.dataPointsForGraph === false) {
         this.state.dataPointsForGraph = this.getAssignments(this.props.booleansForGraph, this.props.totalNames, this.props.metricForGraph, this.props.analyticsForGraph, this.state.dataPointsForGraph, this.props.currentCaptureForGraph)
      }

      var leftMin;
      var rightMax;
      var bottomMin = this.getMinYAxis();
      var topMax = this.getMaxYAxis();
      var currentPoint;

      if (this.state.leftRange === 0 && this.state.rightRange === 0) {
         testArray = this.state.dataPointsForGraph;
         leftMin = this.getMinXAxis();
         rightMax = this.getMaxXAxis();
      } else {
         var jsonObject = Object.keys(this.state.dataPointsForGraph);
         leftMin = parseInt(this.state.leftRange);
         rightMax = parseInt(this.state.rightRange);

         for (var i = 0; i < jsonObject.length; i++) {
            currentPoint = this.state.dataPointsForGraph[i];
            if (currentPoint.seconds <= this.state.rightRange && currentPoint.seconds >= this.state.leftRange) {
               testArray.push(currentPoint);
            }
         }
      }

      const AxisLabel = ({ axisType, x, y, width, height, stroke, children }) => {
        const isVert = axisType === 'yAxis';
        const cx = isVert ? x : x + (width / 2);
        const cy = isVert ? (height / 2) + y : y + height + 10;
        const rot = isVert ? `270 ${cx} ${cy}` : 0;
        return (
          <text x={cx} y={cy} transform={`rotate(${rot})`} textAnchor="middle" stroke={stroke}>
            {children}
          </text>
        );
      };
      let yAxisLabel = "";
      let yAxisPadding = 60;

      if (this.props.metricForGraph === "CPUUtilization") {
        yAxisLabel = "Percentage";
        yAxisPadding = 60;
      }
      else if (this.props.metricForGraph === "FreeableMemory") {
        yAxisLabel = "Bytes";
        yAxisPadding = 100;
      }
      else if (this.props.metricForGraph === "ReadIOPS" || this.props.metricForGraph === "WriteIOPS") {
        yAxisLabel = "Transactions / Second";
        yAxisPadding = 60;
      }

      return (
        <div id="graphContainer">
          <div>
            <div>
              <div height="10%" style={{ textAlign: 'right' }}>
                <h3 style={{ marginLeft: '20px', float:'left', fontWeight: 'bold'}}>{this.props.metricForGraph} for {this.props.currentCaptureForGraph}</h3>

                <a
                  style={{backgroundColor: 'aliceblue', float: 'right', marginLeft: '5px', padding: '5px 10px'}}
                  href="javascript: void(0);"
                  className="btn btn-sm update"
                  onClick={this.zoomOut.bind(this)}
                >
                  {' '}
                  Reset Zoom
                </a>

                <DropdownButton id="downloadBtn" bsSize={'small'} bsStyle={'primary'} title="Download">
                  <MenuItem  onClick={this.downloadObjectAsJson.bind(this)}>Download JSON Data</MenuItem>
                  <MenuItem  onClick={this.exportChart.bind(this)}>Download as Image (SVG)</MenuItem>
                </DropdownButton>

              </div>

               <ResponsiveContainer width="100%" height="40%" overflow="visible">

              <LineChart
                id="currentGraph"
                ref={(graph) => this.currentGraph = graph}
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
                  label="Seconds"
                  height={70}
                  domain={[leftMin, rightMax]}
                  type="number"
                />

                <YAxis
                  allowDataOverflow={true}
                  width={yAxisPadding}
                  domain={[bottomMin, topMax]}
                >
                  <Label angle={-90} value={yAxisLabel} position='insideLeft' style={{textAnchor: 'middle'}} />
                </YAxis>
                <Tooltip />
                <Legend />
                {
                (this.state.refAreaLeft && this.state.refAreaRight) ? (
                  <ReferenceArea x1={this.state.refAreaLeft} x2={this.state.refAreaRight}  strokeOpacity={0.3} /> ) : null
                }
                {this.getLines().map(line => line)}
              </LineChart>
              </ResponsiveContainer>

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
