import React, { Component } from 'react'
import Graph from './Graph'
import alasql from 'alasql'
require('../styles/graphstyles.css')
import { connect } from 'react-redux'
import {
  setDataPointsForGraph,
  setValuesForGraph,
  setMetricForGraph,
  setBooleansForGraph,
  setNumLinesForGraph,
  setReplayCaptureNamesForGraph
} from '../actions'

var selectedColor = '#ADD8E6'
var nonSelectedColor = 'white'

class MetricSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  //helper function that sets the state's current metric to the one that
  //the user selected
  selectMetricForGraph(metric, e) {
    if (
      this.props.metricForGraph != metric ||
      this.props.metricForGraph == false
    ) {
      let arrayOfFalses = []
      for (let i = 0; i < this.props.booleansForGraph.length; i++) {
        arrayOfFalses.push(false)
      }

      this.props.dispatch(
        setBooleansForGraph(
          this.props.booleansForGraph,
          this.props.totalReplayCaptures,
          metric,
          this.props.numLinesForGraph,
          this.props.analyticsForGraph,
          false,
          false
        )
      )
    }
    this.props.dispatch(setMetricForGraph(metric))
  }

  //this is a helper function to change the background color of the metric
  //that has been selected for the user to see
  getbackgroundColor(metricName) {
    if (this.props.metricForGraph == metricName) {
      return selectedColor
    } else {
      return nonSelectedColor
    }
  }

  render() {
    return (
      <table
        className="table table-hover"
        style={{ borderLeft: '1px solid black' }}
      >
        <thead className="thead-dark">
          <tr>
            <th scope="col" colSpan="4">
              Cloudwatch Metrics
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              style={{
                width: '25%',
                textAlign: 'center',
                backgroundColor: this.getbackgroundColor('CPUUtilization')
              }}
              onClick={this.selectMetricForGraph.bind(this, 'CPUUtilization')}
            >
              <img
                src="https://cdn4.iconfinder.com/data/icons/computer-hardware-line-icons-1/48/08-512.png"
                width="50px"
                height="50px"
              />
              <div>
                <strong>
                  CPU <br />Utilization
                </strong>
              </div>
            </td>
            <td
              style={{
                width: '25%',
                textAlign: 'center',
                backgroundColor: this.getbackgroundColor('FreeableMemory')
              }}
              onClick={this.selectMetricForGraph.bind(this, 'FreeableMemory')}
            >
              <img
                src="https://d30y9cdsu7xlg0.cloudfront.net/png/134147-200.png"
                width="50px"
                height="50px"
              />
              <div>
                <strong>
                  Freeable <br />Memory
                </strong>
              </div>
            </td>
            <td
              style={{
                width: '25%',
                textAlign: 'center',
                backgroundColor: this.getbackgroundColor('ReadIOPS')
              }}
              onClick={this.selectMetricForGraph.bind(this, 'ReadIOPS')}
            >
              <img
                src="http://icons.iconarchive.com/icons/iconsmind/outline/512/Open-Book-icon.png"
                width="50px"
                height="50px"
              />
              <div>
                <strong>
                  Read<br /> IOPS
                </strong>
              </div>
            </td>
            <td
              style={{
                width: '25%',
                textAlign: 'center',
                backgroundColor: this.getbackgroundColor('WriteIOPS')
              }}
              onClick={this.selectMetricForGraph.bind(this, 'WriteIOPS')}
            >
              <img
                src="http://cdn.onlinewebfonts.com/svg/img_215612.png"
                width="50px"
                height="50px"
              />
              <div>
                <strong>
                  Write<br /> IOPS
                </strong>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

const mapStateToProps = state => ({
  dataPointsForGraph: state.dataPointsForGraph,
  valuesForGraph: state.valuesForGraph,
  metricForGraph: state.metricForGraph,
  numLinesForGraph: state.numLinesForGraph,
  totalReplayCaptures: state.totalReplayCaptures,
  analyticsForGraph: state.analyticsForGraph,
  booleansForGraph: state.booleansForGraph
  //funcTest: state.selectMetricForGraph
})

export default connect(mapStateToProps)(MetricSelector)
