import React, { Component } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import StaticHome from './StaticHome'
import MakeshiftHome from './MakeshiftHome'

export default class Login extends Component {
    

  constructor(props) {
    super(props)

    this.state = {
      validLogin: false,
      publicKey: this.props.publicKey,
      privateKey: this.props.privateKey,
    }

    this.handlePublicKeyChange = this.handlePublicKeyChange.bind(this)
    this.validateForm = this.validateForm.bind(this)
    this.handlePrivateKeyChange = this.handlePrivateKeyChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  validateForm() {
    // return this.state.email.length > 0 && this.state.password.length > 0
    return true;
  }

  handlePublicKeyChange(inputPublicKey) {
      console.log(inputPublicKey.value)
    this.setState({
      publicKey: inputPublicKey.value
    });
  }

  handlePrivateKeyChange(inputPrivateKey) {
      console.log(inputPrivateKey.value)
    this.setState({
      privateKey: inputPrivateKey.value
    })
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
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Public AWS Key</ControlLabel>
            <FormControl
              autoFocus
              value={this.state.publicKey}
              onChange={this.handlePublicKeyChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Private AWS Key</ControlLabel>
            <FormControl
              value={this.state.privateKey}
              onChange={this.handlePrivateKeyChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            onClick={() => this.setState({validLogin: true})}
          >
            Login
          </Button>
        </form>
      </div>
      );
  }

  renderStaticHome() {
      if(this.state.validLogin == true) {
            console.log('rendering static home');
            return <MakeshiftHome/>
      }
      else {
          console.log('should render login')
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
