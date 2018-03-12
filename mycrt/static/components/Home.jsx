import React, { Component } from 'react'
require('../styles/tabstyles.css')
import '../styles/homestyles.css'
import jquery from 'jquery';
import styles from '../styles/tabstyles.css.js'
import Analytics from './Analytics'
import Capture from './Capture'
import Replay from './Replay'
import { changeStateForComponents, setAnalyticsForGraph } from '../actions/index';
import { connect } from 'react-redux'

class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      onCapture: true,
      onReplay: false,
      onAnalyze: false,
      activeCaptures: this.props.activeCaptures,
      activeReplays: this.props.activeReplays
    }

    this.getPythonAnalytics = this.getPythonAnalytics.bind(this);

  }

  getPythonAnalytics() {
    jquery.get(window.location.href + 'analytics', (data) => {
      this.setState({analytics: data}, this.render);
      this.props.dispatch(setAnalyticsForGraph(data))
    });
    
  }

  componentWillMount() {
    this.getPythonAnalytics();
  }
  
  componentWillReceiveProps() {
    this.getPythonAnalytics();
  }

  renderPage() {
    if (this.props.stateType === "onCapture") {
      return (
        <div className="tabcontent">
          <Capture />
        </div>
      )
    } else if (this.props.stateType == "onReplay") {
      return (
        <div className="tabcontent">
          <Replay />
        </div>
      )
    } else if (this.props.stateType == "onAnalyze") {
      return (
        <div className="tabcontent">
          <h3 style={{ marginLeft: '20px' }}>Analyze</h3>
          <Analytics />
        </div>
      )
    }
  }

  currentAction(action) {
    if (action === 'capture') {
      if (this.props.data.activeCaptures > 1) {
        return (
          <div>{this.props.data.activeCaptures} Captures</div>
        )
      } else if (this.props.data.activeCaptures == 1) {
        return <div>1 Capture</div>
      } else {
        return <div>No Captures</div>
      }
    } else if (action === 'replay') {
      if (this.props.data.activeReplays > 1) {
        return <div>{this.props.data.activeReplays} Replays</div>
      } else if (this.props.data.activeReplays == 1) {
        return <div>1 Replay</div>
      } else {
        return <div>No Replays</div>
      }
    }
  }

  render() {
    var captureActiveStyle =
      this.props.data.activeCaptures > 0 ? styles.active : styles.notActive
    var replayActiveStyle =
      this.props.data.activeReplays > 0 ? styles.active : styles.notActive
    return (
      <div>
        <div className="headerContainer">
          <div id="headerLeft">
            <div>
              <h4>In Progress:</h4>
            </div>
            <div id="captureProgress" className="progressBarContainer">
              <button style={captureActiveStyle} className="progressButton">
                {this.currentAction('capture')}
              </button>
            </div>
            <div id="replayProgress" className="progressBarContainer">
              <button style={replayActiveStyle} className="progressButton">
                {this.currentAction('replay')}
              </button>
            </div>
          </div>
          <div id="headerCenter">
            <h1>
              MyCRT
          </h1>
          </div>
          <div id="headerRight">
            <div id="userContainer">
              <div id="userLogoContainer">
                <span id="userLogo" className="glyphicon glyphicon-user"></span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="tab">
            <button
              className="tablinks"
              onClick={() => this.props.dispatch(changeStateForComponents("onCapture"))}
              id="button"
              type="button"
            >
              Capture
            </button>
            <button className="tablinks" onClick={() => this.props.dispatch(changeStateForComponents("onReplay"))}>
              Replay
            </button>
            <button className="tablinks" onClick={() => this.props.dispatch(changeStateForComponents("onAnalyze"))}>
              Analyze
            </button>
          </div>
          {this.renderPage()}
        </div>
      </div >
    )
  }
}

const mapStateToProps = state => ({
  data: state,
  stateType: state.stateType,
  analyticsForGraph: state.analyticsForGraph

})

export default connect(mapStateToProps)(Home)
