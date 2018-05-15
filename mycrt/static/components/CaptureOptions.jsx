import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector';
import { setCaptureNameForGraph, setTotalNamesForGraph } from '../actions';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

var selectedColor = "#ADD8E6";

class CaptureOptions extends React.Component {
    constructor(props) {
        super(props);
    }

    //renders all of the table rows that hold the values for all capture options to graph
    getCapturesWithData(refProps) {
        function setCaptureName(uniqueName) {
            refProps.dispatch(setCaptureNameForGraph(uniqueName));
            let totalReplayNames = Object.keys(refProps.analyticsForGraph[uniqueName]);
            refProps.dispatch(setTotalNamesForGraph(totalReplayNames))
        }

        var options = {
            onRowClick: function(row) {
                setCaptureName(row["Name"])
            }
        }

        let CaptureOptions = Object.keys(this.props.analyticsForGraph);
        console.log("________DatabaseName needed_______")
        console.log(this.props.analyticsForGraph);
        console.log("_______________")
        var CaptureData = [];
        for(let i = 0; i < CaptureOptions.length; i++) {
            let captureInfo = {
                Name : CaptureOptions[i]
                /* Add in more information for a second column in the future */
            }
            CaptureData.push(captureInfo)
        }
            let replayCaptureOptions = Object.keys(this.props.analyticsForGraph);
            //HERE IS WHERE THE UI WILL CHANGE FIRST
            /**
             * {
             *  cap1 : {
             *       replays : {
             *              repl1: {}, etc.
             * 
             * 
             *                  },
             *        end_time: "TIME"
             *          
             *          }
             *     
             * }
             */
            return (
            <BootstrapTable bodyStyle={ {height: '180px'}} containerStyle={ {position: 'absolute', paddingRight: '20px'} } options={options} hover data={ CaptureData } search={ true } multiColumnSearch={ true }>
                <TableHeaderColumn dataField='Name' isKey>Select a Capture</TableHeaderColumn>
            </BootstrapTable>
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
            <div>
                {this.getCapturesWithData(this.props)}
            </div>
        );
    }

}

const mapStateToProps = state => ({
    analyticsForGraph: state.analyticsForGraph
  })

  export default connect(mapStateToProps)(CaptureOptions)
