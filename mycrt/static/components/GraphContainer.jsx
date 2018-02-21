import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { Button, Glyphicon} from 'react-bootstrap';
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import CaptureReplaySelector from './CaptureReplaySelector'
import { setBooleansForGraph, setCaptureNameForGraph } from '../actions/index';
import CaptureOptions from './CaptureOptions';

var selectedColor = "#ADD8E6";

class GraphContainer extends React.Component {
    constructor(props) {
        super(props);
    
        let dataResult = this.setData();
        this.state = {
          //all unique names of replay captures that user can choose from
          totalReplayCaptures: dataResult.totalReplayCaptures,
        };
        
    }

    //function that is called on initial render of the graph container to set the intial redux state elements
    setData() {
        let result = {};
        if(this.props.data){
            let replayCaptureOptions = [];
            let metricOptions = [];
            let arrayOfFalses = [];
            var count;
            result.totalReplayCaptures = Object.keys(this.props.data)
        }
        return result;
    }

    rerenderCaptures()
    {
        this.props.dispatch(setCaptureNameForGraph("Capture Options"));
    }

    getCaptureReplayHeader() {
        if(this.props.currentCaptureForGraph == "Capture Options") {
            return(
            <th scope="col">{this.props.currentCaptureForGraph}</th>
            );
        }
        else {
            return (
            <th scope="col">
            <Button onClick={this.rerenderCaptures.bind(this)} className="btn-custom" bsSize="small">
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
        if(!this.props.data) {
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
                <CaptureOptions data={this.props.data} totalReplayCaptures={this.state.totalReplayCaptures}/>
            );
        }
        else {
            return (
                <CaptureReplaySelector totalReplayCaptures={Object.keys(this.props.data[this.props.currentCaptureForGraph])}/>

            )
        }
    }
    

    //This function renders the graph object and passes
    //all specified data into it
    renderConfigurableGraph() {
        return (
            <Graph metric={this.props.metricForGraph} values={this.props.replayCaptureNamesForGraph} pointsArray={this.props.dataPointsForGraph} numLines={this.props.numLinesForGraph}/>
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
    currentCaptureForGraph: state.currentCaptureForGraph
  })
  
  export default connect(mapStateToProps)(GraphContainer)