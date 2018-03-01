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
                    <h4 className='captureListHeader'>Active</h4>
                    <div>
                        <ListGroup>
                            {this.props.activeCaptures}
                        </ListGroup>
                    </div>
                </span>
                <span id='scheduledCaptureList' className='captureListGroup'>
                    <h4 className='captureListHeader'>Scheduled</h4>
                    <div>
                        <ListGroup>
                            <ListGroupItem>Capture B</ListGroupItem>
                        </ListGroup>
                    </div>
                </span>
                <span className='captureListGroup'>
                    <h4 className='captureListHeader'>Past</h4>
                    <div>
                        <ListGroup>
                            <ListGroupItem>Capture C</ListGroupItem>
                        </ListGroup>
                    </div>
                </span >
            </div >)
    }
}
