import React, { Component } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import Graph from './Graph';
import alasql from 'alasql';
require('../styles/graphstyles.css');
import ReplayForm from './ReplayForm'
import { connect } from 'react-redux';
import MetricSelector from './MetricSelector'
import { setBooleansForGraph, setCaptureNameForGraph, changeStateForComponents, setSelectedReplay, startReplayFromCapture } from '../actions'

var selectedColor = "#ADD8E6";

class ReplayButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            captureNameForReplayForm: ''
        }
    }

    render() {
        <Button
            type="submit"
            bsSize="small"
            bsStyle="success"
            //@todo: get this working!
            onClick={this.props.refProps.dispatch(changeStateForComponents("onReplay"))}
        >
        Start a New Replay
        </Button>;
    }
}

class CaptureReplaySelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        //list of the total replay names of the currently selected capture that will be displayed
        totalReplayNames: Object.keys(this.props.analyticsForGraph[this.props.currentCaptureForGraph])
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

    createCustomToolBar (props) {
        return (
          <div style={ { margin: '15px' } }>
            { props.components.btnGroup }
            <div className='col-xs-8 col-sm-4 col-md-4 col-lg-2'>
              { props.components.searchPanel }
            </div>
          </div>
        );
      }

    //renders all of the table rows that hold the values for all capture and replay options to graph
    getReplayCapturesWithData(refProps, names) {
        const selectRowProp = {
            mode: 'checkbox',
            bgColor: selectedColor, // you should give a bgcolor, otherwise, you can't regonize which row has been selected
            hideSelectColumn: true,  // enable hide selection column.
            clickToSelect: true,  // you should enable clickToSelect, otherwise, you can't select column.
            selected: this.props.selectedReplay
          };

        //callback function for onclick of something to graph or not graph
        //dispatches an action that updates the boolean array, this updates the datapointsforgraph,
        //the number of lines, and the names for graph in the redux state
        function setReplayCaptureAsTrueFalse(uniqueName) {
            let newBooleans = refProps.booleansForGraph.slice();
            let totalNameOptions = names;
            for(let i = 0; i < refProps.booleansForGraph.length; i++) {
                if(totalNameOptions[i] == uniqueName) {
                    newBooleans[i] = !(newBooleans[i])
                }
            }
            if(refProps.selectedReplay != false) {
                refProps.dispatch(setSelectedReplay(false))
            }
            refProps.dispatch(setBooleansForGraph(newBooleans));
        }


        var None = [{
            none: `No Replays Recorded For ${refProps.currentCaptureForGraph} Yet.`
        }]


        if(this.state.totalReplayNames.length == 0) {
            var options = {
                deleteBtn: this.createCustomDeleteButton.bind(this)
            }
            var that = this;
            var capName = refProps.currentCaptureForGraph;
            function buttonFormatter(cell, row){
                function fakeDispatch(capN) {
                    console.log('in the functionnnn')
                    // if(that.state.captureNameForReplayForm !== capN) {
                    if(that.props.showReplayModal == false) {
                        that.setState({
                            captureNameForReplayForm:capN
                        })
                        refProps.dispatch(startReplayFromCapture())
                    }
                }
                return (
                <Button
                type="submit"
                bsSize="small"
                bsStyle="success"
                // onClick={that.setState({
                //     captureNameForReplayForm:capName
                // }, fakeDispatch())}
                onClick={() => fakeDispatch(capName)}
                >
                Start a New Replay
                </Button>
                );
            }
            return (
            <div>
                <BootstrapTable bodyStyle={ {height: '180px'}} containerStyle={ {position: 'absolute', paddingRight: '20px'} } search={ true } multiColumnSearch={ true } deleteRow options={options} data={ None }>
                    <TableHeaderColumn dataFormat={buttonFormatter} dataField='none' isKey>No Replays Recorded For {refProps.currentCaptureForGraph} Yet.</TableHeaderColumn>
                </BootstrapTable>
            </div>
            )
        }
        else if(this.state.totalReplayNames != false) {
            let replayOptions = this.state.totalReplayNames;
            console.log("________Date Needed_______")
            console.log(this.props.analyticsForGraph);
            console.log("_______________")
            let replayData = [];
            var options = {
                onRowClick: function(row) {
                    setReplayCaptureAsTrueFalse(row["Name"])
                },
                deleteBtn: this.createCustomDeleteButton.bind(this)
            }
            for(let i = 0; i < replayOptions.length; i++) {
                let replayInfo = {
                    Name : replayOptions[i]
                    /* Add in more information for a second column in the future */
                }
                replayData.push(replayInfo)
            }
            return(
                <BootstrapTable selectRow={selectRowProp} bodyStyle={ {height: '180px'}} containerStyle={ {position: 'absolute', paddingRight: '20px'} } deleteRow selectRow={ selectRowProp } options={options} hover data={ replayData } search={ true } multiColumnSearch={ true }>
                    <TableHeaderColumn dataField='Name' isKey>Select Replay(s) From {this.props.currentCaptureForGraph}</TableHeaderColumn>
                </BootstrapTable>
            )
        }
    }

    //reRenders the capture options by dispatching this action when back button is clicked
    //ignore that it says deleteButton - it is required for react-bootstrap-table
    createCustomDeleteButton (onClick) {
        function rerenderCapturesOnBackButton()
        {
            this.props.dispatch(setCaptureNameForGraph("Capture Options"));
        }
        return (
            <Button bsSize="small" onClick={rerenderCapturesOnBackButton.bind(this)}>
            <Glyphicon glyph="chevron-left" />
            Select A Different Capture
            </Button>
        );
    }



    render() {
        console.log('********this is the props in caprepsel: ', this.props.showReplayModal)
        return(
            <div>
            {this.getReplayCapturesWithData(this.props, this.state.totalReplayNames)}
            <ReplayForm onReplayPage={false} captureToReplay={this.state.captureNameForReplayForm} store={this.props} show={this.props.showReplayModal}/>
            </div>
        );
    }

}

const mapStateToProps = state => ({
    booleansForGraph: state.booleansForGraph,
    analyticsForGraph: state.analyticsForGraph,
    currentCaptureForGraph: state.currentCaptureForGraph,
    selectedReplay: state.selectedReplay,
    showReplayModal: state.showReplayModal
  })

  export default connect(mapStateToProps)(CaptureReplaySelector)
