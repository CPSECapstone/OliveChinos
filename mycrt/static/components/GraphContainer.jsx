import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
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

    //either renders Capture Options in table header or renders the current capture name if one is selected
    getCaptureReplayHeader() {
        if(this.props.currentCaptureForGraph == "Capture Options") {
            return(
            <th scope="col">{this.props.currentCaptureForGraph}</th>
            );
        }
        else {
            return (
            <th scope="col">
            <Button onClick={this.rerenderCapturesOnBackButton.bind(this)} className="btn-custom" bsSize="small">
            <Glyphicon glyph="chevron-left" />
            BACK
            </Button>
            {this.props.currentCaptureForGraph}
            </th>
            );
        }
    }

    //Renders the table below the graph
    renderSelectorTable() {
        return (
        <div className='row' style={{height: '24vh', overflowY: 'scroll'}}>
            <div className='col-xs-6' style={{width: '38vw'}} >
                <table className="table table-hover">
                    <thead className="thead-dark" style={{position: 'absolute', width: '38vw'}}>
                    <tr>
                        {this.getCaptureReplayHeader()}
                    </tr>
                    </thead >
                        {this.displayCorrectReplayCaptures()}
                </table>
            </div>
            <div className='col-xs-6' style={{width: '38vw', position: 'absolute', right:'26'}}>
                <MetricSelector />
            </div>
        </div>
        );
    }

    //This will either render the metric table below the graph with data
    //or it will render 'loading data' if the data hasn't come in yet
    displayCorrectReplayCaptures() {
        if(!this.props.analyticsForGraph) {
            return this.getReplayCapturesWithoutData()
        }
        else {
            return this.getReplayCapturesWithData()
        }
    }

    getReplayCapturesWithoutData() {
        return (
            <tbody><tr><td>...Loading Data...</td></tr></tbody>
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
    

    //This function renders the graph object and passes
    //all specified data into it
    renderConfigurableGraph() {
        return (
            <Graph values={this.props.replayCaptureNamesForGraph} pointsArray={this.props.dataPointsForGraph} numLines={this.props.numLinesForGraph}/>
        );
    }



    render() {
        return(
            <div>
            <div>
            <div style={{height:'50vh', border:'1px solid black', overflowY:'scroll'}}>
            <div>
                {this.renderConfigurableGraph()}
            </div>
            </div>
            </div>
                {this.renderSelectorTable()}
            </div>
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
    currentCaptureForGraph: state.currentCaptureForGraph,
    analyticsForGraph: state.analyticsForGraph
  })
  
  export default connect(mapStateToProps)(GraphContainer)