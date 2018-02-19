import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import { setCaptureNameForGraph, setBooleansForGraph } from '../actions'

// var Loader = require('react-loader');

var selectedColor = "#ADD8E6";

class CaptureOptions extends React.Component {
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

    //renders all of the table rows that hold the values for all capture and replay options to graph
    getReplayCapturesWithData() {
        if(this.props.totalReplayCaptures != false) {
            let replayCaptureOptions = this.props.totalReplayCaptures;
            return (
                replayCaptureOptions.map(uniqueName => (
                    <tr id="captureOption" key={uniqueName} onClick={this.setCaptureName.bind(this, uniqueName)}>
                    <td 
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
    setCaptureName(uniqueName, e) {
        console.log('#### K HERE: ', this.props)
        var count = Object.keys(this.props.data[uniqueName]).length
        console.log('wait a minute...', Object.keys(this.props.data[uniqueName]).length)
        console.log('the count is: ', count)
        let arrayOfFalses = []
        for(let i = 0; i < count; i++) {
            arrayOfFalses.push(false)
        }
        console.log('ABOUT TO SET THE ARRAY OF FALSES TO BE: ', arrayOfFalses)
        this.props.dispatch(setBooleansForGraph(arrayOfFalses))
        this.props.dispatch(setCaptureNameForGraph(uniqueName));
    }

    render() {
        return(
            <tbody style={{overflowY: 'scroll'}}>
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
  
  export default connect(mapStateToProps)(CaptureOptions)