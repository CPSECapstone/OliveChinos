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
            let totalReplayNames = Object.keys(refProps.analyticsForGraph[uniqueName]['replays']);
            refProps.dispatch(setTotalNamesForGraph(totalReplayNames))
        }
        function changeTimezone(cell, row) {
            if (cell === 'No end time.') {
               return cell;
            }
            let d = new Date(cell)
            d.setHours(d.getHours() - 7);
            let datestring = d.getFullYear() + "-" + (d.getMonth()+1) 
                           + "-" + d.getDate()  + " " + ("0" + d.getHours()).slice(-2) + ":" 
                           + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
            return datestring
         }

        var options = {
            onRowClick: function(row) {
                setCaptureName(row["Name"])
            }
        }

        let CaptureOptions = Object.keys(this.props.analyticsForGraph);
        var CaptureData = [];
        for(let i = 0; i < CaptureOptions.length; i++) {
            let captureInfo = {
                Name : CaptureOptions[i],
                Date : this.props.analyticsForGraph[CaptureOptions[i]]['end_time']
            }
            CaptureData.push(captureInfo)
        }
            let replayCaptureOptions = Object.keys(this.props.analyticsForGraph);
            return (
            <BootstrapTable bodyStyle={ {height: '180px'}} containerStyle={ {position: 'absolute', paddingRight: '20px'} } options={options} hover data={ CaptureData } search={ true } multiColumnSearch={ true }>
                <TableHeaderColumn dataField='Name' isKey>Select a Capture</TableHeaderColumn>
                <TableHeaderColumn dataField='Date' dataFormat={changeTimezone}></TableHeaderColumn>
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
