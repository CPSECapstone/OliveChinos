import React, { Component } from 'react';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
require('../styles/loader.css');
import { Button, Glyphicon, ToggleButtonGroup, ToggleButton} from 'react-bootstrap';
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import CaptureReplaySelector from './CaptureReplaySelector'
import { setCaptureNameForGraph, setBooleansForGraph} from '../actions/index';
import CaptureOptions from './CaptureOptions';

var selectedColor = "#ADD8E6";

class GraphContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            graphingCapture: false
        }
        this.handleChange = this.handleChange.bind(this);
        
    }

    handleChange(e) {
        if(e[0] == this.props.currentCaptureForGraph) {
            this.graphCapture(true)
        } else {
            this.graphCapture(false)
        }
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
                    {this.renderCaptureAnalytics()}
                </div>
            </div>

            <div className='row bsTable'>
                {this.displayCorrectReplayCaptures()}
            </div>
        </div>
        );
    }

    graphCapture(graphOrNot) {
        let newBools = this.props.booleansForGraph.slice()
        for(let i = 0; i < this.props.booleansForGraph.length; i++) {
            if(this.props.totalNames[i] == this.props.currentCaptureForGraph) {
                newBools[i] = graphOrNot
            }
        }
        this.props.dispatch(setBooleansForGraph(newBools))
    }

    renderCaptureAnalytics() {
        if(this.props.currentCaptureForGraph !== 'Capture Options') {
            if(this.props.analyticsForGraph[this.props.currentCaptureForGraph]['replays'][this.props.currentCaptureForGraph] !== false && this.props.analyticsForGraph[this.props.currentCaptureForGraph]['replays'][this.props.currentCaptureForGraph] !== undefined ) {
                return(
                    <div style={{textAlign:'center'}}>
                        <ToggleButtonGroup onChange={this.handleChange} type="checkbox" name="graph capture">
                        <ToggleButton id="toggle" value={this.props.currentCaptureForGraph} >
                        <Glyphicon glyph="signal" style={{paddingRight:'8px'}}/>
                            Graph {this.props.currentCaptureForGraph}
                        </ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                )
            } else {
                return(
                    <div style={{textAlign:'center'}}>
                        <ToggleButtonGroup type="radio" name="options" title='Sorry, we do not support graphing captures with custom endpoints yet!'>
                            <ToggleButton id="toggle" value={'Graph Capture'} disabled>
                            <Glyphicon glyph="signal" style={{paddingRight:'8px'}}/>
                                Graph {this.props.currentCaptureForGraph}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                )
            }
        }
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
    analyticsForGraph: state.analyticsForGraph,
    booleansForGraph: state.booleansForGraph,
    totalNames: state.totalNames,
    metricForGraph: state.metricForGraph,
    captureIsGraphed: state.captureIsGraphed
  })
  
  export default connect(mapStateToProps)(GraphContainer)