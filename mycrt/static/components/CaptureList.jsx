// import React, { Component } from 'react'
// import jquery from 'jquery'
// import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
// import '../styles/captureliststyles.css'
// import '../styles/capturestyles.css'
// import '../styles/loader.css'
// import { ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'


// export default class CaptureList extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             captureType: 'Active'
//         }

//         this.handleCaptureTypeChange = this.handleCaptureTypeChange.bind(this)
//     }

//     handleCaptureTypeChange(event) {
//         this.setState({ captureType: event })
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
//                     {this.props.activeCaptures}
//                 </div>
//             )
//         }
//         else if (this.state.captureType == 'Scheduled') {
//             return (
//                 <div>
//                     {this.props.scheduledCaptures}
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
//                         {this.props.completedCaptures}
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

import React, { Component } from 'react'
import jquery from 'jquery'
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import '../styles/captureliststyles.css'
import '../styles/capturestyles.css'
import '../styles/loader.css'
import { connect } from 'react-redux'
import { ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap'


class CaptureList extends React.Component {
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


    renderCapturesTable(data, captureState) {
      let currentCaptures = [];
      let current;
      let captureEditAction;
      let that = this;
      function buttonFormatter(cell, row) {
        if (captureState === 'completed') {
          return (
            <div className='row'>
              <Button className='btn-warning'
                onClick={() => that.editCapture(row["captureName"], row["db"], 'REPLAY')}
              >
                REPLAY
            </Button>
              <Button className='btn-danger' style={{ marginLeft: '10px' }}
                onClick={() => that.editCapture(row["captureName"], row["db"], 'delete')}
              >
                DELETE
            </Button>
            </div>
          );
        }
        else if (captureState === 'active') {
          return (
            <div className='row'>
              <Button className='btn-danger'
                onClick={() => that.editCapture(row["captureName"], row["db"], 'end')}
              >
                STOP
            </Button>
            </div>
          );
        }
        else if (captureState === 'scheduled') {
          return (
            <div className='row'>
              <Button className='btn-danger'
                onClick={() => that.editCapture(row["captureName"], row["db"], 'cancel')}
              >
                CANCEL
            </Button>
            </div>
          );
        }
        else {
          <div></div>
        }
      }

      if (data.length > 0) {
        return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} search={true} multiColumnSearch={true} data={data}>
          <TableHeaderColumn dataField='captureName' isKey dataSort>Capture Name</TableHeaderColumn>
          <TableHeaderColumn dataField='db' dataSort>Database</TableHeaderColumn>
          <TableHeaderColumn dataField='rds' dataSort>RDS Instance</TableHeaderColumn>
          <TableHeaderColumn dataField='startTime' dataSort>Start Time</TableHeaderColumn>
          <TableHeaderColumn dataField='endTime' dataSort>End Time</TableHeaderColumn>
          <TableHeaderColumn dataField='status' dataFormat={buttonFormatter}>Action</TableHeaderColumn>
        </BootstrapTable>
      }
      else {
        return <BootstrapTable containerStyle={{ position: 'absolute', padding: '0px 20px 20px 0px' }} bodyStyle={{ overflow: 'auto' }} data={[]} search={true} multiColumnSearch={true} >
          <TableHeaderColumn isKey={true} dataField='something'>Capture Name</TableHeaderColumn>
          <TableHeaderColumn >Database</TableHeaderColumn>
          <TableHeaderColumn >RDS Instance</TableHeaderColumn>
          <TableHeaderColumn >Start Time</TableHeaderColumn>
          <TableHeaderColumn >End Time</TableHeaderColumn>
          <TableHeaderColumn >Action</TableHeaderColumn>

        </BootstrapTable>
      }
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
                    {this.renderCapturesTable(this.props.capturesActive, 'active')}
                </div>
            )
        }
        else if (this.state.captureType == 'Scheduled') {
            return (
                <div>
                    {this.renderCapturesTable(this.props.capturesScheduled, 'scheduled')}
                </div>
            )
        }
        else if (this.state.captureType == 'Completed') {
            
            return (
                <div>
                    {this.renderCapturesTable(this.props.capturesCompleted, 'completed')}
                </div>
            )
            
        }
        else {
            <div></div>
        }
    }
    render() {
        console.log("JAKE: ", this.props.capturesActive);
        return (
            <div>
                {this.renderRadioButtons()}
                {this.renderTable()}
            </div>
        )

        

        // if (this.props.capturesActive.length <= 0) {
        //     return (
        //         <div>
        //             {this.renderRadioButtons()}
        //             <div id="loader" className='col'></div>
        //         </div>
        //     )
        // }
        // else return (
        //     <div>
        //         {this.renderRadioButtons()}
        //         {this.renderTable()}
        //     </div>
        // )
    }
}

const mapStateToProps = state => ({
  isCapturesLoaded: state.isCapturesLoaded,
  capturesActive: state.capturesActive,
  capturesCompleted: state.capturesCompleted,
  capturesScheduled: state.capturesScheduled
  
})

export default connect(mapStateToProps)(CaptureList)