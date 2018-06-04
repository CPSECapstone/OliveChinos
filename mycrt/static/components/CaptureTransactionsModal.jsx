import React, { Component } from 'react'
import { Modal, OverlayTrigger, Button, Popover, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { setDisplayCaptureTransactionsModal } from '../actions'

class CaptureTransactionsModal extends React.Component {
   constructor(props) {
      super(props);

      this.handleClose = this.handleClose.bind(this);
   }

   handleClose() {
      this.props.dispatch(setDisplayCaptureTransactionsModal(false));
   }

   render() {
      let transactions = this.props.captureTransactions.transactions.map((transaction) => <li key={transaction}>{transaction}</li>)
      return (
         <div>
            <Modal show={this.props.showCaptureTransactions} onHide={this.handleClose}>
               <Modal.Header closeButton>
                  <Modal.Title>MySQL Transactions</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  <ul>
                     {transactions}
                  </ul>
               </Modal.Body>
               <Modal.Footer>
                  <Button onClick={this.handleClose}>Close</Button>
               </Modal.Footer>
            </Modal>
         </div>
      );
   }
}

const mapStateToProps = state => ({
   showCaptureTransactions: state.showCaptureTransactions,
   captureTransactions: state.captureTransactions

})

export default connect(mapStateToProps)(CaptureTransactionsModal)
