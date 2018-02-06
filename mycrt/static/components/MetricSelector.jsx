import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { connect } from 'react-redux';
import { setDataPointsForGraph, setValuesForGraph, setMetricForGraph, setBooleansForGraph, setNumLinesForGraph, setReplayCaptureNamesForGraph } from '../actions'

var selectedColor = "#ADD8E6";
var nonSelectedColor = "white";

class MetricSelector extends React.Component {
    constructor(props) {
        super(props);
    }

    //helper function that sets the state's current metric to the one that
    //the user selected
    selectMetricForGraph(metric, e) {
        if((this.props.metricForGraph != metric) || (this.props.metricForGraph == false)) {
            let arrayOfFalses = []
            for(let i = 0; i < this.props.booleansForGraph.length; i++) {
                arrayOfFalses.push(false)
            }
            console.log('setting new metric, arrayof falses is: ', arrayOfFalses)
            this.props.dispatch(setBooleansForGraph(arrayOfFalses, this.props.totalReplayCaptures, metric, this.props.numLinesForGraph, this.props.analyticsForGraph, false, false))
            // this.props.dispatch(setValuesForGraph(false))
            // this.props.dispatch(setReplayCaptureNamesForGraph(false))
            // this.props.dispatch(setDataPointsForGraph(false))
            // this.props.dispatch(setNumLinesForGraph(0))
        }
        this.props.dispatch(setMetricForGraph(metric));
    }

    //this is a helper function to change the background color of the metric
    //that has been selected for the user to see
    getbackgroundColor(metricName) {
        if(this.props.metricForGraph == metricName) {
            return selectedColor;
        } else {
            return nonSelectedColor;
        }
    }


    render() {
        return(
            <table className="table table-hover" style={{borderLeft:'1px solid black'}}>
            <thead className="thead-dark">
            <tr>
                <th scope="col">Select Metric</th>
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
        )
    }
}

const mapStateToProps = state => ({
    dataPointsForGraph: state.dataPointsForGraph,
    valuesForGraph: state.valuesForGraph,
    metricForGraph: state.metricForGraph,
    numLinesForGraph: state.numLinesForGraph,
    totalReplayCaptures: state.totalReplayCaptures,
    analyticsForGraph: state.analyticsForGraph,
    booleansForGraph: state.booleansForGraph
  })
  
  export default connect(mapStateToProps)(MetricSelector)
  
