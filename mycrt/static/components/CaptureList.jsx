import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import '../styles/captureliststyles.css'


export default class CaptureList extends React.Component {
    constructor(props) {
        super(props)

    }

    render() {
        return (
            <div>
                <span className='captureListGroup'>
                    <div className='captureListHeader'><h4>Active</h4></div>
                    <div className='captureListContainer'>

                        <ListGroup>
                            {this.props.activeCaptures}
                        </ListGroup>
                    </div>
                </span>
                <span id='scheduledCaptureList' className='captureListGroup'>
                    <div className='captureListHeader'><h4>Scheduled</h4></div>
                    <div className='captureListContainer'>
                        <ListGroup>
                            {this.props.scheduledCaptures}
                        </ListGroup>
                    </div>
                </span>
                <span className='captureListGroup'>
                    <div className='captureListHeader'><h4>Completed</h4></div>
                    <div className='captureListContainer'>
                        <ListGroup>
                            {this.props.completedCaptures}
                        </ListGroup>
                    </div>
                </span >
            </div >)
    }
}
