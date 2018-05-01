import React, { Component } from 'react'
require('../styles/tabstyles.css')
import '../styles/homestyles.css'
import { Button, Glyphicon } from 'react-bootstrap';
import jquery from 'jquery';
import styles from '../styles/tabstyles.css.js'
import Analytics from './Analytics'
import Capture from './Capture'
import Replay from './Replay'
import { changeStateForComponents, setAnalyticsForGraph, setReplayCount, setCaptureCount, setDatabaseInstances } from '../actions/index';
import { connect } from 'react-redux'
import  IssueModal  from  './issueModal'
import InfoAnalytics from './infoAnalytics'
import io from 'socket.io-client';


const uri = 'http://localhost:5000';
const options = {};
const socket = io(uri, options);

class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      onCapture: true,
      onReplay: false,
      onAnalyze: false,
      activeCaptures: this.props.activeCaptures,
      activeReplays: this.props.activeReplays,
      captureTab: 'blue',
      replayTab: 'red',
      analyticsTab: 'orange',
      issueShow: false,
      analyticsInfoShow: false
    }

    this.getPythonAnalytics = this.getPythonAnalytics.bind(this);
    this.pollingFunction = this.pollingFunction.bind(this);
    this.getNumberOfCaptures = this.getNumberOfCaptures.bind(this);
    this.getNumberOfReplays = this.getNumberOfReplays.bind(this);
    this.setUpWebSocketReplayNumber = this.setUpWebSocketReplayNumber.bind(this);
    this.setUpWebSocketCaptureNumber = this.setUpWebSocketCaptureNumber.bind(this);
    this.loadDatabaseInstances = this.loadDatabaseInstances.bind(this);

  }

  setUpWebSocketReplayNumber() {
    var that = this;
    socket.on('replayNumber', function (numReplays) {
      console.log('Replay Number update from backend: ', numReplays);
      that.setState({ activeReplays: numReplays }, that.render);
      that.props.dispatch(setReplayCount(numReplays))
    });
  }
  setUpWebSocketCaptureNumber() {
    var that = this;
    socket.on('captureNumber', function (numCaptures) {
      console.log('Capture Number update from backend: ', numCaptures);
      that.setState({ activeCaptures: numCaptures }, that.render);
      that.props.dispatch(setCaptureCount(numCaptures))
    });
  }

  getPythonAnalytics() {
    jquery.get(window.location.href + 'analytics', (data) => {
      this.setState({ analytics: data }, this.render);
      this.props.dispatch(setAnalyticsForGraph(data))
    });

  }

  getNumberOfReplays() {
    var that = this;
    jquery.get(window.location.href + 'replay/number', (data) => {
      that.setState({ activeReplays: data.replays.length }, that.render);
      that.props.dispatch(setReplayCount(data.replays.length))
    });
  }

  getNumberOfCaptures() {
    var that = this;
    jquery.get(window.location.href + 'capture/number', (data) => {
      that.setState({ activeCaptures: data.numberOfCaptures }, that.render);
      that.props.dispatch(setCaptureCount(data.numberOfCaptures))
    });
  }

  pollingFunction() {
    this.getPythonAnalytics();
    this.getNumberOfReplays();
    this.getNumberOfCaptures();
  }

  loadDatabaseInstances() {
    let that = this;
    let returnList = []
    jquery.ajax({
      url: window.location.href + 'databaseInstances',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).done(function (data) {
      that.props.dispatch(setDatabaseInstances(data));
    })
  }

  componentWillMount() {
    var that = this;
    this.setUpWebSocketCaptureNumber();
    this.setUpWebSocketReplayNumber();
    this.loadDatabaseInstances();
    socket.emit('alert_button', 'Message from Home.jsx');
    setTimeout(this.getPythonAnalytics, 5000);
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
          <h3 style={{ marginLeft: '20px' }}>Analytics 
          <Glyphicon style={{paddingLeft:'20px', cursor:'pointer'}} glyph="info-sign" 
          onClick={() => this.setState({ analyticsInfoShow: true })}/>
          </h3>
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
    var tabActiveStyle = this.props.stateForComponents;
    var classNames = require('classnames');
    let issueClose = () => this.setState({ issueShow: false });
    let analyticsInfoClose = () => this.setState({ analyticsInfoShow: false})
    return (
      <div>
        <div className="headerContainer">
          <div id="headerLeft">
            <div>
              <h4>In Progress:</h4>
            </div>
            <div id="captureProgress" className="progressBarContainer">
              <button style={captureActiveStyle} onClick={() => this.props.dispatch(changeStateForComponents("onCapture"))} className="progressButton">
                {this.currentAction('capture')}
              </button>
            </div>
            <div id="replayProgress" className="progressBarContainer">
              <button style={replayActiveStyle} onClick={() => this.props.dispatch(changeStateForComponents("onReplay"))} className="progressButton">
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
            <div id="issueContainer">
              <div>
                <Button 
                  className='issueButton'
                  onClick={() => this.setState({ issueShow: true })}
                >Submit an Issue</Button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="tab" >
            <button
              className={classNames({ 'tablinks': true, 'activeTab': this.props.stateType == 'onCapture' })}
              onClick={() => { console.log(this.props.stateType); this.props.dispatch(changeStateForComponents("onCapture")) }}
              type="button"
            >
              Capture
            </button>
            <button className={classNames({ 'tablinks': true, 'activeTab': this.props.stateType == 'onReplay' })}
              onClick={() => this.props.dispatch(changeStateForComponents("onReplay"))}>
              Replay
            </button>
            <button className={classNames({ 'tablinks': true, 'activeTab': this.props.stateType == 'onAnalyze' })}
              onClick={() => this.props.dispatch(changeStateForComponents("onAnalyze"))}>
              Analyze
            </button>
          </div>
          {this.renderPage()}
          <IssueModal show={this.state.issueShow} onHide={issueClose}/>
          <InfoAnalytics show={this.state.analyticsInfoShow} onHide={analyticsInfoClose}/>
          
        </div>
      </div >
    )
  }
}



const mapStateToProps = state => ({
  data: state,
  stateType: state.stateType,
  analyticsForGraph: state.analyticsForGraph,
  databaseInstances: state.databaseInstances
})

export default connect(mapStateToProps)(Home)
