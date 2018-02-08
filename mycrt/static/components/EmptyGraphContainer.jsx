import React, { Component } from 'react';
require('../styles/graphstyles.css');
import MetricSelector from './MetricSelector'
import Graph from './Graph'

export default class EmptyGraphContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        
    }

    //Empty metric selector for when data is still loading
    renderMetricSelector() {
        return (
        <div className='row'>
            <div className='col-xs-6' style={{width: '38vw'}}>
            <table className="table table-hover">
                <thead className="thead-dark">
                <tr>
                    <th scope="col">Replay/Capture Options</th>
                </tr>
                </thead>
                <tbody><tr><td>...Loading Data...</td></tr></tbody>
            </table>
        </div>
        <div className='col-xs-6' style={{width: '38vw'}}>
            <MetricSelector/>
        </div>
        </div>
        );
    }

    renderConfigurableGraph() {
        return (
            <Graph metric={this.props.metricForGraph} values={this.props.valuesForGraph} pointsArray={this.props.valuesForGraph} numLines={this.props.numLinesForGraphing} keys={this.props.selectedReplayCaptureNames}/>
        );
    }

    render() {
        return(
            <div>
            <div>
            <div style={{height:'50vh', border:'1px solid black', overflowY:'scroll'}}>
            <div>
            </div>
            {this.renderConfigurableGraph()}
            </div>
            </div>
                {this.renderMetricSelector()}
            </div>
        );
    }

}