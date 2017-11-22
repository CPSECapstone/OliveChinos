import React, { Component } from 'react';
import jquery from 'jquery';
import { Button } from 'react-bootstrap';

/* Use this element as a reference when creating components*/

export default class Replay extends React.Component {

constructor(props) {
    super(props);

    this.state = {replay: 'Replay Inactive'};

  //binding required for callback
    this.startReplay = this.startReplay.bind(this);
}

startReplay() {
    this.setState({replay: 'Replay Active'});
//   jquery.get(window.location.href + 'capture', (data) => {
//     this.setState({capture: data});
//   });
}

  render () {
    return (
      <div>
        <hr/>
        <Button style={{marginLeft:'20px'}} bsSize="large" bsStyle="success" onClick={this.startReplay}>
          Start Replay
        </Button>
        <hr/>
        <h4 style={{marginLeft:'20px'}}>{this.state.replay}</h4>
      </div>
    );
  }
}
