import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import { setDataPointsForGraph, setValuesForGraph, setNumLinesForGraph, setBooleansForGraph, setReplayCaptureNamesForGraph } from '../actions'

// var Loader = require('react-loader');

var selectedColor = "#ADD8E6";

class GraphContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          //used to be graphData, currently selected replay/captures:
          selectedReplayCaptureNames: [],
          //all unique names of replay captures that user can choose from
          totalReplayCaptures: this.props.totalReplayCaptures,
          //array of booleans for each replay/capture option: true if selected and false if not selected
          rcBooleans: this.props.rcBooleans,
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
        console.log('color debugger: ', uniqueName)
        console.log('***#### ', this.props)
        let captureReplaysSelected = []
        for(let i = 0; i < this.props.booleansForGraph.length; i++) {
            if(this.props.booleansForGraph[i]) {
                // let totalNames = this.props.replayCaptureNamesForGraph;
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


    getReplayCapturesWithData() {
        if(this.props.totalReplayCaptures != false) {
            let replayCaptureOptions = this.props.totalReplayCaptures;
            return (
                replayCaptureOptions.map(uniqueName => (
                    <tr onClick={this.setReplayCaptureAsTrueFalse.bind(this, uniqueName)}>
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
    

    setReplayCaptureAsTrueFalse(uniqueName, e) {
        if(this.props.metricForGraph != false) {
            let newBooleans = this.props.rcBooleans;
            let totalNameOptions = this.state.totalReplayCaptures;
            let addOrSubtractLine = 0;
            for(let i = 0; i < totalNameOptions.length; i++) {
                if(totalNameOptions[i] == uniqueName) {
                    if(newBooleans[i] == true) {
                        addOrSubtractLine = -1;
                    }
                    else {
                        addOrSubtractLine = 1;
                    }
                    newBooleans[i] = !newBooleans[i]
                    
                }
            }
            this.props.dispatch(setBooleansForGraph(newBooleans, this.props.totalReplayCaptures, this.props.metricForGraph, this.props.numLinesForGraph, this.props.analyticsForGraph, this.props.dataPointsForGraph, uniqueName));
        }
        else {
            alert('Must choose metric type')
        }
    }

    render() {
        console.log('CRSELECTOR PROPS: ', this.props)
        return(
            <tbody>
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
    analyticsForGraph: state.analyticsForGraph
  })
  
  export default connect(mapStateToProps)(GraphContainer)