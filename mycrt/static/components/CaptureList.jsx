import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import '../styles/captureliststyles.css'
import '../styles/capturestyles.css'
import '../styles/loader.css'
import { ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'


export default class CaptureList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            captureType: 'Active'
        }

        this.handleCaptureTypeChange = this.handleCaptureTypeChange.bind(this)
    }

    handleCaptureTypeChange(event) {
        this.setState({ captureType: event })
    }

    renderRadioButtons() {
        return (
            <ButtonToolbar className="buttonToolbar">
                <ToggleButtonGroup type="radio" name="options" value={this.state.captureType} onChange={this.handleCaptureTypeChange}>
                    <ToggleButton className="toggleButton" id="toggle" value='Active' >
                        Active
                </ToggleButton>
                    <ToggleButton className="toggleButton" id="toggle" value='Scheduled' >
                        Scheduled
                </ToggleButton>
                    <ToggleButton className="toggleButton" id="toggle" value='Completed' >
                        Completed
                </ToggleButton>
                </ToggleButtonGroup>
            </ButtonToolbar>
        )
    }

    renderTable() {
        console.log('THE CAPTURE TYPE IS: ', this.state.captureType)
        if (this.state.captureType == 'Active') {
            return (
                <div>
                    {this.props.activeCaptures}
                </div>
            )
        }
        else if (this.state.captureType == 'Scheduled') {
            return (
                <div>
                    {this.props.scheduledCaptures}
                </div>
            )
        }
        else if (this.state.captureType == 'Completed') {
            if (this.props["completedCaptures"].length <= 0) {
                return (
                    <div id="loader" className='col'></div>
                )
            }
            else {
                return (
                    <div>
                        {this.props.completedCaptures}
                    </div>
                )
            }
        }
    }
    render() {
        if (this.props["activeCaptures"].length <= 0) {
            return (
                <div>
                    {this.renderRadioButtons()}
                    <div id="loader" className='col'></div>
                </div>
            )
        }
        else return (
            <div>
                {this.renderRadioButtons()}
                {this.renderTable()}
            </div>
        )
    }
}

// import React, { Component } from 'react'
// import jquery from 'jquery'
// import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
// import '../styles/captureliststyles.css'
// import '../styles/capturestyles.css'
// import '../styles/loader.css'
// import { connect } from 'react-redux'
// import { ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'


// class CaptureList extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             captureType: 'Active'
//         }
//         console.log("CAPTURESACTIVE in CaptureList: ", this.props.capturesActive);
//         console.log("CAPTURESCOMPLETED in CaptureList: ", this.props.capturesCompleted);
//         this.handleCaptureTypeChange = this.handleCaptureTypeChange.bind(this)
//     }

//     handleCaptureTypeChange(event) {
//         this.setState({ captureType: event })
//     }

//     componentWillReceiveProps() {
//         console.log("CaptureList RECEIVED new props");
//         console.log("CAPTURESSCHEDULED in CaptureList: ", this.props.capturesScheduled);

//     }

//     renderRadioButtons() {
//         return (
//             <ButtonToolbar className="buttonToolbar">
//                 <ToggleButtonGroup type="radio" name="options" value={this.state.captureType} onChange={this.handleCaptureTypeChange}>
//                     <ToggleButton className="toggleButton" id="toggle" value='Active' >
//                         Active
//                 </ToggleButton>
//                     <ToggleButton className="toggleButton" id="toggle" value='Scheduled' >
//                         Scheduled
//                 </ToggleButton>
//                     <ToggleButton className="toggleButton" id="toggle" value='Completed' >
//                         Completed
//                 </ToggleButton>
//                 </ToggleButtonGroup>
//             </ButtonToolbar>
//         )
//     }

//     renderTable() {
//         console.log('THE CAPTURE TYPE IS: ', this.state.captureType)
//         if (this.state.captureType == 'Active') {
//             return (
//                 <div>
//                     {this.props.capturesActive}
//                 </div>
//             )
//         }
//         else if (this.state.captureType == 'Scheduled') {
//             return (
//                 <div>
//                     {this.props.capturesScheduled}
//                 </div>
//             )
//         }
//         else if (this.state.captureType == 'Completed') {
//             if (this.props["completedCaptures"].length <= 0) {
//                 return (
//                     <div id="loader" className='col'></div>
//                 )
//             }
//             else {
//                 return (
//                     <div>
//                         {this.props.capturesCompleted}
//                     </div>
//                 )
//             }
//         }
//     }
//     render() {
//         if (this.props["activeCaptures"].length <= 0) {
//             return (
//                 <div>
//                     {this.renderRadioButtons()}
//                     <div id="loader" className='col'></div>
//                 </div>
//             )
//         }
//         else return (
//             <div>
//                 {this.renderRadioButtons()}
//                 {this.renderTable()}
//             </div>
//         )
//     }
// }

// const mapStateToProps = state => ({
//   isCapturesLoaded: state.isCapturesLoaded,
//   capturesActive: state.capturesActive,
//   capturesCompleted: state.capturesCompleted,
//   capturesScheduled: state.capturesScheduled
  
// })

// export default connect(mapStateToProps)(CaptureList)