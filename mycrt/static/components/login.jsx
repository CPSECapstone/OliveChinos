import React, { Component } from 'react'
import { connect } from 'react-redux'
import jquery from 'jquery'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import Home from './Home'
import '../styles/loginstyles.css'
import '../styles/homestyles.css'

import { setAuth } from '../actions'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      validLogin: this.props.loggedIn,
      username: this.props.username,
      password: this.props.password,
      loginError: false
    }
    this.self = this
    this.validateForm = this.validateForm.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleUsernameChange = this.handleUsernameChange.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getPythonLogin = this.getPythonLogin.bind(this)
    this.authenticate = this.authenticate.bind(this)
  }

  validateForm() {
    // return this.state.email.length > 0 && this.state.password.length > 0
    return true
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value })
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value })
  }

  getPythonLogin() {
    var loginRequest = {
      username: this.state.username,
      password: this.state.password
    }

    return jquery.ajax({
      url: window.location.href + 'login',
      type: 'POST',
      data: JSON.stringify(loginRequest),
      contentType: 'application/json',
      dataType: 'json'
    })
  }

  authenticate() {
    this.props.dispatch(setAuth())
  }

  handleLogin(event) {
    event.preventDefault()
    var that = this
    this.getPythonLogin()
      .then(function(result) {
        that.authenticate()
      })
      .catch(function(error) {
        that.setState({ loginError: true })
      })
  }

  errorMessage() {
    if (this.state.loginError == false) {
      return
    } else {
      return (
        <div
          style={{color:'red',
          margin:'auto',
          textAlign:'center'}}
        >
          Invalid Login Credentials
        </div>
      )
    }
  }

  handleSubmit(event) {
    event.preventDefault()
  }

  renderLogin() {
    return (
      <div>
      <div>
        <div className="headerContainer">
          <div id="headerLeft">
            
            
          </div>
          <div id="headerCenter">
            <h1>
              MyCRT
          </h1>
          </div>
          </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          width: '30vw',
          border: 'thin solid black',
          padding: '15px',
          height: '35vh'
        }}
        className="Login"
      >
        <form onSubmit={this.handleLogin}>
          <ControlLabel>Username</ControlLabel>
          <br />
          <input type="text" onChange={this.handleUsernameChange} />
          <br />
          <ControlLabel style={{ marginTop: '10px' }}>
            Password
          </ControlLabel>
          <br />
          <input style={{marginBottom:'30px'}}type="text" onChange={this.handlePasswordChange} />
          <div className='row'>
          <Button
            block
            bsSize="small"
            disabled={!this.validateForm()}
            type="submit"
            onClick={this.handleLogin}
            className="loginButton"
          >
            Login
          </Button>
          {this.errorMessage()}
          </div>
        </form>
      </div>
      </div>
    )
  }

  renderHome() {
    if (this.props.loggedIn == true) {
      return <Home />
    } else {
      return this.renderLogin()
    }
  }

  render() {
    return (
      <div>
        <div>{this.renderHome()}</div>
        <div />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  loggedIn: state.loggedIn,
  username: state.username,
  password: state.password
})

export default connect(mapStateToProps)(Login)
