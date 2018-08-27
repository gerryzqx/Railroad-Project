import React,{Compoonent, Component} from 'react';
import {Button, TextField} from 'material-ui';
import io from 'socket.io-client';

class NewPassenger extends Component {
    constructor (props) {
        super(props);
        this.state = {
            fname: '',
            lname: '',
            email: '',
            password: '',
            card: '',
            address: '',
            sending: false
        }
        this.valueUpdate = this.valueUpdate.bind(this);
        this.sendSignup = this.sendSignup.bind(this);
        this.socket = io('http://35.190.187.221:3000');
    }
    componentDidMount() {
        this.socket.on('create_user_backend_err', (data)=>{
          this.props.notify('Something went wrong on our side :( Please try later.');
          this.props.back();
        })
        this.socket.on('create_user_exists', (data)=>{
            this.props.notify('Looks like that E-Mail or Card is already in use.');
            this.setState({
                email: '',
                card: '',
                sending: false
            })
        })
        this.socket.on('create_user_success', (data)=>{
            this.props.notify(`Successfully signed you up! Your Passenger ID is ${data.id}`);
            this.props.back();
        })
    }
    valueUpdate(e){
        this.setState({
            [e.target.id]: e.target.value
        })
    }
    sendSignup(){
        this.setState({
            sending: true
        })
        if (
            this.state.fname === '' ||
            this.state.lname === '' ||
            this.state.email === '' ||
            this.state.password === '' ||
            this.state.card === '' ||
            this.state.address === ''
        ) {
            this.props.notify("You're missing some information");
            this.setState({
                sending:false
            })
        } else {
            this.props.notify("Signing you up, just a moment...");
            this.socket.emit('create_user', {
                fname: this.state.fname,
                lname: this.state.lname,
                email: this.state.email,
                password: this.state.password,
                card: this.state.card,
                address: this.state.address
            })
        }
    }
    render () {
        return (
            <div style={{padding:36}}>
                <TextField className="newP-input" fullWidth
                    disabled={this.state.sending}
                    id="fname"
                    label="First Name"
                    value={this.state.fname}
                    required={true}
                    onChange={(e)=>{this.valueUpdate(e)}}  
                    maxLength={30}
                />
                <TextField className="newP-input" fullWidth 
                disabled={this.state.sending}
                    id="lname"
                    label="Last Name"
                    value={this.state.lname}
                    required={true}
                    onChange={(e)=>{this.valueUpdate(e)}}  
                    maxLength={30}
                />
                <TextField className="newP-input" fullWidth 
                disabled={this.state.sending}
                    id="email"
                    type="email"
                    label="E-Mail"
                    value={this.state.email}
                    required={true}
                    onChange={(e)=>{this.valueUpdate(e)}}  
                    maxLength={100}
                />
                <TextField className="newP-input" fullWidth 
                disabled={this.state.sending}
                    id="password"
                    type="password"
                    label="Password"
                    value={this.state.password}
                    required={true}
                    onChange={(e)=>{this.valueUpdate(e)}}  
                    maxLength={100}
                />
                <TextField className="newP-input" fullWidth 
                disabled={this.state.sending}
                    id="card"
                    label="Card Number"
                    value={this.state.card}
                    required={true}
                    onChange={(e)=>{this.valueUpdate(e)}}  
                    maxLength={16}
                />
                <TextField className="newP-input" fullWidth 
                disabled={this.state.sending}
                    id="address"
                    label="Billing Address"
                    value={this.state.address}
                    required={true}
                    onChange={(e)=>{this.valueUpdate(e)}}  
                    maxLength={100}
                />
                <Button disabled={this.state.sending} color="accent" raised onClick={()=>{this.sendSignup()}}>
                    SignUp
                </Button>
                <Button disabled={this.state.sending} color="primary" onClick={this.props.back} >
                    Cancel
                </Button>
            </div>
        );
    }
}

export default NewPassenger;