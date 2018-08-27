import React, {Component} from 'react';
import {TextField, Button} from 'material-ui';
import io from 'socket.io-client';
import './App.css';

class CheckReservation extends Component{
    constructor(props){
        super(props);
        this.state = {
            resid: '',
            fallback: '',
            ticket: null
        }
        this.socket = io('http://35.190.187.221:3000');
        this.getStatus = this.getStatus.bind(this);
    }
    componentDidMount(){
        this.socket.on('query_result',(data)=>{
            if (data.code || data.info) this.props.notify('That reservation might already be cancelled.');
            else {
                this.setState({
                    ticket: data[0]
                })
            }
        })
        this.socket.on('cancel_err', (err)=>{
            this.props.notify("We weren't able to cancel this reservation.");
        })
        this.socket.on('cancel_success', (data)=>{
            this.props.notify('Successfully cancelled your reservation.');
            this.setState({
                resid: '',
                fallback: '',
                ticket: null
            })
        })
    }
    getStatus(){
        this.socket.emit('query',{
            sql: `select * from reservations where reservation_id = ${this.state.resid}`,
            password: 'team7336'
        })
        this.setState({
            fallback:this.state.resid
        })
    }
    cancelReserve(){
        this.socket.emit('delete_reservation',{
            num:this.state.fallback
        })
    }
    render() {
        return(
            <div style={{padding:36}}>
                <TextField
                    fullWidth
                    label="Reservation ID#"
                    value={this.state.resid}
                    onChange={(e)=>{
                        if (e.target.value.length < 11 && e.target.value >= 1)
                        this.setState({
                            resid: parseInt(e.target.value)
                        });
                        else if (e.target.value.length === 0)
                        this.setState({
                            resid: ''
                        });
                    }}
                />
                <Button
                    className="see-train-btn"
                    raised
                    color="primary"
                    disabled={this.state.resid === '' ? true:false}
                    onClick={()=>{this.getStatus()}}
                >
                    Get Status
                </Button>
                {
                    this.state.ticket?
                    <div>
                        <TextField
                            style={{marginTop:10}}
                            fullWidth
                            disabled={true}
                            label="Passenger ID"
                            value={this.state.ticket.paying_passenger_id}
                        />
                        <TextField
                        style={{marginTop:10}}
                            fullWidth
                            disabled={true}
                            label="Reservation Date & Time"
                            value={this.state.ticket.reservation_date}
                        />
                        <TextField
                        style={{marginTop:10}}
                            fullWidth
                            disabled={true}
                            label="Card Number"
                            value={this.state.ticket.card_number}
                        />
                        <TextField
                        style={{marginTop:10}}
                            fullWidth
                            disabled={true}
                            label="Billing Address"
                            value={this.state.ticket.billing_address}
                        />
                        <Button
                            raised
                            color="accent"
                            className="see-train-btn"
                            onClick={()=>{this.cancelReserve()}}
                        >
                            cancel reservation
                        </Button>
                    </div>:
                    null
                }
            </div>
        );
    }
}

export default CheckReservation;