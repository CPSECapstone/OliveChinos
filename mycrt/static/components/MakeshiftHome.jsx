import React, { Component } from 'react';
require('../styles/tabstyles.css');
import styles from '../styles/tabstyles.css.js';
import Analytics from './Analytics';
import Capture from './Capture';
import Replay from './Replay';
import {connect} from 'react-redux';

class MakeshiftHome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            onCapture: true,
            onReplay: false,
            onAnalyze: false,
            captureActive: this.props.captureActive,
            replayActive: this.props.replayActive,
          }
    }

    renderCapture() {
        if(this.state.onCapture == false) {
          this.setState({onCapture: true});
          this.setState({onReplay: false});
          this.setState({onAnalyze: false});
        }
        this.renderPage();
      }
    
      renderReplay() {
        if(this.state.onReplay == false) {
          this.setState({onReplay: true});
          this.setState({onCapture: false});
          this.setState({onAnalyze: false});
        }
        this.renderPage();
      }
    
      renderAnalyze() {
        if(this.state.onAnalyze == false) {
          this.setState({onAnalyze: true});
          this.setState({onCapture: false});
          this.setState({onReplay: false});
        }
        this.renderPage();
      }
    
      renderPage() {
        if(this.state.onCapture == true) {
          return(
            <div className='tabcontent'>
              <h3 style={{marginLeft:'20px'}}>Capture</h3>
              <Capture />
            </div>
          );
        }
        else if(this.state.onReplay == true) {
          return(
            <div className='tabcontent'>
              <h3 style={{marginLeft:'20px'}}>Replay</h3>
              <Replay />
            </div>
          );
        }
        else if(this.state.onAnalyze == true) {
          return(
            <div className='tabcontent'>
            <h3 style={{marginLeft:'20px'}}>Analyze</h3>
              <Analytics />
            </div>
          );
        }
      }

      currentAction() {
        if(this.props.data.captureActive == true) {
          return <div >Capture in Progress...</div>
        }
        else if(this.props.data.replayActive == true) {
          return <div >Replay in Progress...</div>
        }
        else {
          return <div></div>
        }
      }

    render() {
      var activeStyle = this.props.data.captureActive || this.props.data.replayActive ? styles.active : styles.notActive;
        return(
            <div>
            <h1 style={{textAlign:'center', marginBottom:'30px'}}>MyCRT Tool</h1>
            <div>
              <div className="tab">
                <button style={activeStyle} className="tablinks">{this.currentAction()}</button>
                <button className="tablinks" onClick={() => this.renderCapture()} id="button" type="button">Capture</button>
                <button className="tablinks" onClick={() => this.renderReplay()}>Replay</button>
                <button className="tablinks" onClick={() => this.renderAnalyze()}>Analyze</button>
              </div>
              {this.renderPage()}
            </div>
          </div>
        );
    }
}

const mapStateToProps = state => ({data: state})

export default connect(mapStateToProps)(MakeshiftHome)