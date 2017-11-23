import React, { Component } from 'react';


class CurrentAction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            replayActive = this.props.replayActive,
            captureActive = this.props.captureActive
        }
    }

    currentAction() {
        if(this.props.captureActive == true) {
          return <div className='captureActive'>Capture in Progress...</div>
        }
        else if(this.props.replayActive==true) {
          return <div className='replayActive'>Replay in Progress...</div>
        }
        else {
          return <div></div>
        }
      }

    render() {
        return(
            <div>{this.currentAction()}</div>
        );
    }
}