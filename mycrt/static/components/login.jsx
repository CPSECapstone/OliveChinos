import React, { Component } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import StaticHome from './StaticHome'
import MakeshiftHome from './MakeshiftHome'

export default class Login extends Component {
    

  constructor(props) {
    super(props)

    this.state = {
      email: '',
      password: '',
      validLogin: false
    }

    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.validateForm = this.validateForm.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  validateForm() {
    // return this.state.email.length > 0 && this.state.password.length > 0
    return true;
  }

  handleEmailChange(inputEmail) {
      console.log(inputEmail.value)
    this.setState({
      email: inputEmail.value
    });
  }

  handlePasswordChange(inputPassword) {
      console.log(inputPassword.value)
    this.setState({
      password: inputPassword.value
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
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleEmailChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handlePasswordChange}
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
