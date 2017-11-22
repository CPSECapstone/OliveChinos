import React, { Component } from 'react';
require('../styles/tabstyles.css');
import Analytics from './Analytics';
import Capture from './Capture';

export default class MakeshiftHome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            onCapture: true,
            onReplay: false,
            onAnalyze: false
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
              <h3 style={{marginLeft:'30px'}}>Capture</h3>
              <Capture />
            </div>
          );
        }
        else if(this.state.onReplay == true) {
          return(
            <div className='tabcontent'>On Replay page</div>
          );
        }
        else if(this.state.onAnalyze == true) {
          return(
              <div>
            <div className='tabcontent'>On Analyze page
            <Analytics />
            </div>
                
            </div>
          );
        }
    
      }

    render() {
        return(
            <div>
            <h1 style={{textAlign:'center', marginBottom:'30px'}}>MyCRT Tool</h1>
            <div>
              <div className="tab">
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