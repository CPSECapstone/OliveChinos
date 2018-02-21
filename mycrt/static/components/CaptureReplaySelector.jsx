import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import { setDataPointsForGraph, setValuesForGraph, setNumLinesForGraph, setBooleansForGraph, setReplayCaptureNamesForGraph } from '../actions'

// var Loader = require('react-loader');

var selectedColor = "#ADD8E6";

class CaptureReplaySelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          //used to be graphData, currently selected replay/captures:
          selectedReplayCaptureNames: [],
          //all unique names of replay captures that user can choose from
          totalReplayCaptures: this.props.totalReplayCaptures,
          //Final JSON object to be sent to Graph component
          listOfTotalPointsForGraph: [],
          //List of x values for a specified metric
          valuesForGraph: [],
          //number of current lines on graph
          numLinesForGraphing: 0,
          currUniqueNames: []
        };
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

     //this is a helper function to change the background color of the metric
    //that has been selected for the user to see
    getbackgroundColor(uniqueName) {
        let captureReplaysSelected = []
        for(let i = 0; i < this.props.booleansForGraph.length; i++) {
            if(this.props.booleansForGraph[i]) {
                let totalNames = this.props.totalReplayCaptures
                captureReplaysSelected.push(totalNames[i])
            }
        }
        if(this.contains(uniqueName, captureReplaysSelected)) {
            return selectedColor;
        } else {
            return "white";
        }
    }

    //renders all of the table rows that hold the values for all capture and replay options to graph
    getReplayCapturesWithData() {
        if(this.props.totalReplayCaptures.length == 0) {
            return (
                <tr>
                    <td>No Replays Recorded For This Capture Yet.</td>
                </tr>
            )
        }
        else if(this.props.totalReplayCaptures != false) {
            let replayCaptureOptions = this.props.totalReplayCaptures;
            return (
                replayCaptureOptions.map(uniqueName => (
                    <tr key={uniqueName} onClick={this.setReplayCaptureAsTrueFalse.bind(this, uniqueName)}>
                    <td
                    style={{backgroundColor: this.getbackgroundColor(uniqueName)}}
                    key={uniqueName}>
                    {uniqueName}
                    </td>
                    </tr>
                ))
            );
        }
        }

    //callback function for onclick of something to graph or not graph
    //dispatches an action that updates the boolean array, this updates the datapointsforgraph,
    //the number of lines, and the names for graph in the redux state
    setReplayCaptureAsTrueFalse(uniqueName, e) {
        if(this.props.metricForGraph != false) {
            let newBooleans = this.props.booleansForGraph;
            let totalNameOptions = this.props.totalReplayCaptures;
            let addOrSubtractLine = 0;
            for(let i = 0; i < this.props.booleansForGraph.length; i++) {
                if(totalNameOptions[i] == uniqueName) {
                    newBooleans[i] = !(newBooleans[i])

                }
            }
            let dataPoints = this.props.dataPointsForGraph
            if(dataPoints == undefined) {
                dataPoints = false;
            }
            this.props.dispatch(setBooleansForGraph(newBooleans, this.props.totalReplayCaptures, this.props.metricForGraph, this.props.numLinesForGraph, this.props.analyticsForGraph, dataPoints, uniqueName, this.props.currentCaptureForGraph));
        }
        else {
            alert('Please select metric type')
        }
    }

    render() {
        return(
            <tbody style={{overflowY: 'scroll'}}>
                <tr style={{height:'50px'}}></tr>
                {this.getReplayCapturesWithData()}
            </tbody>
        );
    }

}

const mapStateToProps = state => ({
    dataPointsForGraph: state.dataPointsForGraph,
    valuesForGraph: state.valuesForGraph,
    metricForGraph: state.metricForGraph,
    numLinesForGraph: state.numLinesForGraph,
    booleansForGraph: state.booleansForGraph,
    replayCaptureNamesForGraph: state.replayCaptureNamesForGraph,
    analyticsForGraph: state.analyticsForGraph,
    currentCaptureForGraph: state.currentCaptureForGraph
  })

  export default connect(mapStateToProps)(CaptureReplaySelector)
