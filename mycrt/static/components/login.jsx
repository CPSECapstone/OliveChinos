import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import StaticHome from './StaticHome'
import MakeshiftHome from './MakeshiftHome'

import {setAuth, setPublicKey, setPrivateKey} from '../actions'


class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {
      validLogin: this.props.loggedIn,
      publicKey: this.props.publicKey,
      privateKey: this.props.privateKey
    }

    this.validateForm = this.validateForm.bind(this)
    this.handlePrivateKeyChange = this.handlePrivateKeyChange.bind(this)
    this.handlePublicKeyChange = this.handlePublicKeyChange.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  validateForm() {
    // return this.state.email.length > 0 && this.state.password.length > 0
    return true;
  }

  handlePrivateKeyChange(event) {
    this.setState({privateKey: event.target.value});
  }

  handlePublicKeyChange(event) {
    this.setState({publicKey: event.target.value});
  }

  handleLogin(event) {
    event.preventDefault();
    this.props.dispatch(setAuth())
    this.props.dispatch(setPublicKey(this.state.publicKey));
    this.props.dispatch(setPrivateKey(this.state.privateKey));
  }

  handleSubmit(event) {
    event.preventDefault()
  }

  renderLogin() {
      return(
    <div
      style={{
          textAlign:'center',
          width:'50vw',
          border:'thin solid black',
          padding: '15px'
          }}className="Login">
        <form onSubmit={this.handleLogin}>
        <ControlLabel>Public AWS Key</ControlLabel>
        <input type="text" onChange={this.handlePublicKeyChange} />
        <ControlLabel>Private AWS Key</ControlLabel>
        <input type="text" onChange={this.handlePrivateKeyChange} />
        <Button
          block
          bsSize="large"
          disabled={!this.validateForm()}
          type="submit"
          onClick={this.handleLogin}
        >
          Login
        </Button>
        </form>
      </div>
      );
  }

  renderStaticHome() {
      if(this.props.loggedIn == true) {
            return <MakeshiftHome/>
      }
      else {
        return (this.renderLogin());
      }
  }

  render() {
    return (
        <div>
      {this.renderStaticHome()}
      </div>
    );
  }
}

const mapStateToProps = state => ({loggedIn: state.loggedIn, publicKey: state.publicKey, privateKey: state.privateKey})

export default connect(mapStateToProps)(Login)
