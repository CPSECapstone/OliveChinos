import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
require('../styles/loader.css');
import { Button, Glyphicon} from 'react-bootstrap';
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import CaptureReplaySelector from './CaptureReplaySelector'
import { setCaptureNameForGraph } from '../actions/index';
import CaptureOptions from './CaptureOptions';

var selectedColor = "#ADD8E6";

class GraphContainer extends React.Component {
    constructor(props) {
        super(props);
        
    }

    //reRenders the capture options by dispatching this action when back button is clicked
    rerenderCapturesOnBackButton()
    {
        this.props.dispatch(setCaptureNameForGraph("Capture Options"));
    }

    //Renders the table below the graph
    renderSelectorTable() {
        return (
        <div>
            <div className='row'>
                <div>
                    <MetricSelector />
                </div>
            </div>

            <div className='row bsTable'>
                {this.displayCorrectReplayCaptures()}
            </div>
        </div>
        );
    }

    //This will either render the metric table below the graph with data
    //or it will render 'loading data' if the data hasn't come in yet
    displayCorrectReplayCaptures() {
        if(this.props.analyticsForGraph == false) {
            return this.getReplayCapturesWithoutData()
        }
        else {
            return this.getReplayCapturesWithData()
        }
    }

    getReplayCapturesWithoutData() {
        return (
            <div className='row bsTable'>
            <h4 className='col'>Fetching AWS RDS Data</h4>
            <div id="loader" className='col'></div>
            </div>
        );
    }

    getReplayCapturesWithData() {
        if(this.props.currentCaptureForGraph == 'Capture Options') {
            return (
                <CaptureOptions />
            );
        }
        else {
            return (
                <CaptureReplaySelector />

            )
        }
    }



    render() {
        return(
            <div>
            <div>
            <div style={{minHeight:'40vh', padding:'2px'}}>
            <div>
                <Graph />
            </div>
            </div>
            </div>
                {this.renderSelectorTable()}
            </div>
        );
    }

}

const mapStateToProps = state => ({
    currentCaptureForGraph: state.currentCaptureForGraph,
    analyticsForGraph: state.analyticsForGraph
  })
  
  export default connect(mapStateToProps)(GraphContainer)