import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import { setCaptureNameForGraph, setTotalNamesForGraph } from '../actions'

var selectedColor = "#ADD8E6";

class CaptureOptions extends React.Component {
    constructor(props) {
        super(props);
    }

    //renders all of the table rows that hold the values for all capture options to graph
    getCapturesWithData() {
            let replayCaptureOptions = Object.keys(this.props.analyticsForGraph);
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

    //callback function for onclick of something to graph or not graph
    //dispatches an action that updates the curentCapture name and the totalReplay names for that capture in the redux state
    setCaptureName(uniqueName, e) {
        this.props.dispatch(setCaptureNameForGraph(uniqueName));
        let totalReplayNames = Object.keys(this.props.analyticsForGraph[uniqueName]);
        this.props.dispatch(setTotalNamesForGraph(totalReplayNames))
    }

    render() {
        return(
            <tbody style={{overflowY: 'scroll'}}>
                {this.getCapturesWithData()}
            </tbody>
        );
    }

}

const mapStateToProps = state => ({
    analyticsForGraph: state.analyticsForGraph
  })

  export default connect(mapStateToProps)(CaptureOptions)
