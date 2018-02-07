import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import CaptureReplaySelector from './CaptureReplaySelector'
import { setBooleansForGraph } from '../actions/index';

var selectedColor = "#ADD8E6";

class GraphContainer extends React.Component {
    constructor(props) {
        super(props);
    
        let dataResult = this.setData();
        this.state = {
          //all unique names of replay captures that user can choose from
          totalReplayCaptures: dataResult.totalReplayCaptures,
          //array of booleans for each replay/capture option: true if selected and false if not selected
          rcBooleans: dataResult.rcBooleans
        };
        
    }

    //function that is called on initial render of the graph container to set the intial redux state elements
    setData() {
        let result = {};
        if(this.props.data){
            let replayCaptureOptions = [];
            let metricOptions = [];
            let arrayOfFalses = [];
            var count = Object.keys(this.props.data["test_folder"]).length;
            let currentData = this.props.data["test_folder"]
            for(let i = 1; i < (count + 1); i++) {
                let title = "test-metrics"+i
                replayCaptureOptions.push(title)
                arrayOfFalses.push(false)
            }
            result.totalReplayCaptures = replayCaptureOptions;
            result.rcBooleans = arrayOfFalses;
            this.props.dispatch(setBooleansForGraph(arrayOfFalses))
        }
        return result;
    }

    //Renders the table below the graph
    renderSelectorTable() {
        return (
        <div className='row'>
            <div className='col-xs-6' style={{width: '38vw'}} >
                <table className="table table-hover">
                    <thead className="thead-dark">
                    <tr>
                        <th scope="col">Replay/Capture Options</th>
                    </tr>
                    </thead>
                        {this.displayCorrectReplayCaptures()}
                </table>
            </div>
            <div className='col-xs-6' style={{width: '38vw'}}>
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
        return (
            <CaptureReplaySelector totalReplayCaptures={this.state.totalReplayCaptures} rcBooleans={this.state.rcBooleans}/>
        );
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
    replayCaptureNamesForGraph: state.replayCaptureNamesForGraph
  })
  
  export default connect(mapStateToProps)(GraphContainer)