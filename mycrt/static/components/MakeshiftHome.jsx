import React, { Component } from 'react'
require('../styles/tabstyles.css')
import styles from '../styles/tabstyles.css.js'
import Analytics from './Analytics'
import Capture from './Capture'
import Replay from './Replay'
import { connect } from 'react-redux'

class MakeshiftHome extends Component {
  constructor(props) {
    super(props)

    this.state = {
      onCapture: true,
      onReplay: false,
      onAnalyze: false,
      activeCaptures: this.props.activeCaptures,
      activeReplays: this.props.activeReplays
    }
  }

  renderCapture() {
    if (this.state.onCapture == false) {
      this.setState({ onCapture: true })
      this.setState({ onReplay: false })
      this.setState({ onAnalyze: false })
    }
    this.renderPage()
  }

  renderReplay() {
    if (this.state.onReplay == false) {
      this.setState({ onReplay: true })
      this.setState({ onCapture: false })
      this.setState({ onAnalyze: false })
    }
    this.renderPage()
  }

  renderAnalyze() {
    if (this.state.onAnalyze == false) {
      this.setState({ onAnalyze: true })
      this.setState({ onCapture: false })
      this.setState({ onReplay: false })
    }
    this.renderPage()
  }

  renderPage() {
    if (this.state.onCapture == true) {
      return (
        <div className="tabcontent">
          <h3 style={{ marginLeft: '20px' }}>Capture</h3>
          <Capture />
        </div>
      )
    } else if (this.state.onReplay == true) {
      return (
        <div className="tabcontent">
          <h3 style={{ marginLeft: '20px' }}>Replay</h3>
          <Replay />
        </div>
      )
    } else if (this.state.onAnalyze == true) {
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
          <div>{this.props.data.activeCaptures} Captures in Progress...</div>
        )
      } else if (this.props.data.activeCaptures == 1) {
        return <div>1 Capture in Progress...</div>
      } else {
        return <div>No Captures in Progress</div>
      }
    } else if (action === 'replay') {
      if (this.props.data.activeReplays > 1) {
        return <div>{this.props.data.activeReplays} Replays in Progress...</div>
      } else if (this.props.data.activeReplays == 1) {
        return <div>1 Replay in Progress...</div>
      } else {
        return <div>No Replays in Progress</div>
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
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          MyCRT Tool
        </h1>
        <div>
          <div className="tab">
            <div className="tablinks">
              <div className="captureActiveTab">
                <button style={captureActiveStyle} className="tablinks">
                  {this.currentAction('capture')}
                </button>
              </div>
              <div className="replayActiveTab">
                <button style={replayActiveStyle} className="tablinks">
                  {this.currentAction('replay')}
                </button>
              </div>
            </div>
            <button
              className="tablinks"
              onClick={() => this.renderCapture()}
              id="button"
              type="button"
            >
              Capture
            </button>
            <button className="tablinks" onClick={() => this.renderReplay()}>
              Replay
            </button>
            <button className="tablinks" onClick={() => this.renderAnalyze()}>
              Analyze
            </button>
          </div>
          {this.renderPage()}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({ data: state })

export default connect(mapStateToProps)(MakeshiftHome)
