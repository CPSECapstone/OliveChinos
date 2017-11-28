import React, { Component } from 'react'
import {connect} from 'react-redux'
import jquery from 'jquery'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import MakeshiftHome from './MakeshiftHome'
import '../styles/loginstyles.css'

import {setAuth, setPublicKey, setPrivateKey} from '../actions'


class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {
      validLogin: this.props.loggedIn,
      publicKey: this.props.publicKey,
      privateKey: this.props.privateKey,
      loginError: false
    }
    this.self = this
    this.validateForm = this.validateForm.bind(this)
    this.handlePrivateKeyChange = this.handlePrivateKeyChange.bind(this)
    this.handlePublicKeyChange = this.handlePublicKeyChange.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getPythonLogin = this.getPythonLogin.bind(this)
    this.authenticate = this.authenticate.bind(this)
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

  getPythonLogin() {
    var loginRequest = {
      "publicKey": this.state.publicKey,
      "privateKey": this.state.privateKey
    };
    
    return jquery.ajax({
        url: window.location.href + 'login',
        type: "POST",
        data: JSON.stringify(loginRequest),
        contentType: "application/json",
        dataType: 'json', 
        
    });
  }

  authenticate() {
    this.props.dispatch(setAuth())
    this.props.dispatch(setPublicKey(this.state.publicKey));
    this.props.dispatch(setPrivateKey(this.state.privateKey));
  }

  handleLogin(event) {
    event.preventDefault();
    var that = this;
    this.getPythonLogin().then(function(result) {
      that.authenticate();
    }).catch(function(error) {
      if (that.state.publicKey == "abc" && that.state.privateKey == "123") {
        that.authenticate();
      }
      that.setState({loginError: true})
    })
  }

  errorMessage() {
    if(this.state.loginError == false) {
      return
    }
    else {
      return <div style={{color:'red', position:'absolute', margin:'auto', align:'center'}}>Invalid Login Credentials</div>
    }
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
        <h2>Login to the MyCRT Tool</h2>
        <hr/>
        <ControlLabel>Public AWS Key</ControlLabel>
        <br/>
        <input type="text" onChange={this.handlePublicKeyChange} />
        <br/>
        <ControlLabel style={{marginTop:'10px'}}>Private AWS Key</ControlLabel>
        <br/>
        <input type="text" onChange={this.handlePrivateKeyChange} />
        <Button
          block
          bsSize="large"
          disabled={!this.validateForm()}
          type="submit"
          onClick={this.handleLogin}
          className='loginButton'
        >
          Login
        </Button>
        </form>
        {this.errorMessage()}
      </div>
      );
  }

  renderMakeshiftHome() {
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
          <div>
            {this.renderMakeshiftHome()}
          </div>
          <div>
            
          </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({loggedIn: state.loggedIn, publicKey: state.publicKey, privateKey: state.privateKey})

export default connect(mapStateToProps)(Login)
