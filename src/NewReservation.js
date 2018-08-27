import React, {Component} from 'react';
import {Button,
        FormControl,
        Input,
        InputLabel,
        MenuItem,
        Select,
        Table,
        TableHead,
        TableBody,
        TableRow,
        TableCell,
        Typography
    } from 'material-ui';
import {DatePicker, TimePicker} from 'material-ui-pickers';
import LeftArrow from 'material-ui-icons/KeyboardArrowLeft';
import RightArrow from 'material-ui-icons/KeyboardArrowRight';
import Searching from 'material-ui-icons/Search';
import * as moment from 'moment';
import io from 'socket.io-client';
import './App.css';
import TextField from 'material-ui/TextField/TextField';

class NewReservation extends Component{
    constructor (props) {
        super(props);
        this.state= {
            date: new Date(),
            time: new Date(),
            stationList: [{station_id:1,station_name:'test1'},{station_id:2,station_name:'test2'}],
            toStation: '',
            fromStation: '',
            selectedTrain: '',
            trains: null,
            searching: false,
            fallback: null,
            pid: '',
            card: '',
            address: ''
        }
        this.socket = io('http://35.190.187.221:3000');
        this.socket.emit('get_station',{});
        this.getTrains = this.getTrains.bind(this);
        this.selectTrain = this.selectTrain.bind(this);
        this.unselect = this.unselect.bind(this);
        this.makeReservation = this.makeReservation.bind(this);
    }
    componentDidMount(){
        this.socket.on('station_list', (data)=>{
            this.setState({
                stationList: data
            })
        })
        this.socket.on('fetch_station_list', (err)=>{
            this.props.notify('We could not fetch the stations :(')
            console.log(err);
        })
        this.socket.on('available_trains', (data)=>{
            if (data.length === 0){
                this.props.notify('There are no available trains for that time.');
            }
            this.setState({
                trains: data,
                fallback: data,
                searching: false
            })
        })
        this.socket.on('fetch_train_err', (err)=>{
            this.props.notify('Oops, something went wrong trying to find trains :(')
            this.setState({
                searching: false
            })
        })
        this.socket.on('reservation_err', (err)=>{
            console.log(err);
            this.props.notify('Something went wrong :/ This may be due to an invalid Passenger ID.')
        })
        this.socket.on('confirm_reserve', (rows)=>{
            console.log(rows);
            this.props.notify(`Confirmed your reservation! Reservation #${rows[0][0].reservation_number}`)
            this.props.back();
        })
    }
    formattedTime(){
        var d = this.state.date;
        return `${d.getHours() < 9? '0'+d.getHours(): d.getHours()}:${d.getMinutes() < 9? '0'+d.getMinutes(): d.getMinutes()}:${d.getSeconds() < 9? '0'+d.getSeconds(): d.getSeconds()}`;
    }
    formattedDate(){
        var d = this.state.time;
        return `${d.getFullYear()}-${d.getUTCMonth()+1 < 9? '0'+d.getUTCMonth(): d.getUTCMonth()+1}-${d.getUTCDate() <9? '0'+d.getUTCDate(): d.getUTCDate()}`;
    }
    getTrains(){
        if (this.state.fromStation === this.state.toStation) this.props.notify("You need to change your from/to station.");
        else if (this.state.fromStation === '') this.props.notify('Please specify where you are travelling from.');
        else if (this.state.toStation === '') this.props.notify('Please specify where you want to travel to.');
        else {
            var tod = 'NIGHT';
            console.log('Get', this.state.time.getHours());
            if (this.state.time.getHours()>=6 && this.state.time.getHours()<12) tod = 'MOR';
            else if (this.state.time.getHours()>=12 && this.state.time.getHours()<18) tod = 'AFT';
            else if (this.state.time.getHours()>=18) tod = 'EVE';
            console.log('TOD',tod);
            this.socket.emit('get_avail_trains', {
                date: this.formattedDate(),
                time: tod,
                from: this.state.fromStation,
                to: this.state.toStation
            })
            this.setState({
                searching: true
            })
        }
    }
    selectTrain(i){
        if (this.state.trains.length > 1) {
            var shortened = [this.state.trains[i]];
            console.log(shortened);
            this.setState({
                trains:shortened,
                selectedTrain: this.state.fallback[i]
            })
        }
    }
    unselect() {
        this.setState({
            trains: this.state.fallback,
            selectedTrain: ''
        })
    }
    makeReservation() {
        if (this.state.address !== '' && this.state.card !== '' && this.state.address !== '') {
            this.socket.emit('make_reservation',{
                date:this.formattedDate(),
                from:this.state.fromStation,
                to:this.state.toStation,
                pid:this.state.pid,
                card:this.state.card,
                address:this.state.address,
                train:this.state.selectedTrain.train_id
            })
        } else {
            this.props.notify('Looks like there is some missing info.')
        }
    }
    render() {
        return (
            <div style={{padding:36}}>
                <div className="datetime">
                    <DatePicker
                        disabled={this.state.selectedTrain === '' ? false:true}
                        className="date"
                        label="Date"
                        value={this.state.date}
                        autoOk={true}
                        leftArrowIcon={<LeftArrow />}
                        rightArrowIcon={<RightArrow />}
                        returnMoment={true}
                        disablePast={true}
                        onChange={(date)=>{this.setState({date:date.toDate()})}}
                    />
                    <TimePicker
                        disabled={this.state.selectedTrain === '' ? false:true}
                        className="time"
                        label="Time"
                        ampm={false}
                        autoOk={true}
                        value={this.state.time}
                        returnMoment={true}
                        onChange={(time)=>{this.setState({time:time.toDate()});console.log(time.toDate().getHours());}}
                    />
                </div>
                { this.state.stationList?
                    <div className="stations">
                        <FormControl className="selector">
                            <InputLabel htmlFor="from-station">
                                From
                            </InputLabel>
                            <Select
                                disabled={this.state.selectedTrain === '' ? false:true}
                                input={<Input name="from" id="from-station" />}
                                value={this.state.fromStation}
                                onChange={(e)=>{
                                    this.setState({fromStation:e.target.value})
                                }}
                            >
                            {
                                this.state.stationList.map((data,index)=>{
                                    return(
                                        <MenuItem value={data.station_id} key={`from${index}`}>
                                            {data.station_name}
                                        </MenuItem>
                                    );
                                })
                            }
                            </Select>
                        </FormControl>
                        <FormControl className="selector">
                            <InputLabel htmlFor="to-station">
                                To
                            </InputLabel>
                            <Select
                                disabled={this.state.selectedTrain === '' ? false: true}
                                autoWidth
                                input={<Input name="to" id="to-station" />}
                                value={this.state.toStation}
                                onChange={(e)=>{
                                    this.setState({toStation: e.target.value})
                                }}
                            >
                            {
                                this.state.stationList.map((data,index)=>{
                                    return(
                                        <MenuItem value={data.station_id} key={`to${index}`}>
                                            {data.station_name}
                                        </MenuItem>
                                    );
                                })
                            }
                            </Select>
                        </FormControl>
                    </div>:
                    <div className="stations">
                        'Loading...'
                    </div>
                }
                <Button
                    className="see-train-btn" 
                    raised 
                    color="primary"
                    disabled={this.state.selectedTrain !== '' || !this.state.stationList || this.state.searching ? true: false}
                    onClick={()=>{this.getTrains()}}
                >
                    find trains
                </Button>
                {
                    this.state.searching === true ?
                    <div className="searching"><Searching />Searching...</div>:
                    null
                }
                {
                    this.state.selectedTrain === '' ? null:
                    <div className="selected-title"> 
                        <h4>
                            Selected Train
                        </h4>
                        <Button color="primary" dense onClick={()=>{this.unselect()}}>
                            change train
                        </Button>
                    </div>
                }
                {
                    this.state.trains?
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    Train Arrival Time
                                </TableCell>
                                <TableCell>
                                    Available Seats
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.state.trains.map((data, index)=>{
                                    return(
                                        <TableRow 
                                            key={`row${index}`} 
                                            className="train-opt"
                                            onClick={()=>{this.selectTrain(index)}}
                                        >
                                            <TableCell>
                                                {data['Time of Day']}
                                            </TableCell>
                                            <TableCell>
                                                {data['Seats Availiable']}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>:
                    null
                }
                {
                    this.state.selectedTrain === '' ? null:
                    <div>
                        <TextField 
                            style={{marginTop:10}}
                            fullWidth
                            label="Passenger ID #"
                            value={this.state.pid}
                            onChange={(e)=>{
                                if (e.target.value.length < 11) {
                                    this.setState({
                                        pid: e.target.value
                                    })
                                }
                            }}
                        />
                        <TextField
                            style={{marginTop:10}}
                            fullWidth
                            label="Card Number"
                            value={this.state.card}
                            onChange={(e)=>{
                                if (e.target.value.length < 16) {
                                    this.setState({
                                        card: e.target.value
                                    })
                                }
                            }}
                        />
                        <TextField
                            style={{marginTop:10,marginBottom:10}}
                            fullWidth
                            label="Billing Address"
                            value={this.state.address}
                            onChange={(e)=>{
                                if (e.target.value.length < 100) {
                                    this.setState({
                                        address: e.target.value
                                    })
                                }
                            }}
                        />
                        <Button
                            className="see-train-btn"
                            color="accent"
                            raised
                            onClick={()=>{this.makeReservation()}}
                        >
                            RESERVE A SEAT
                        </Button>
                    </div>
                }
            </div>
        );
    }
}

export default NewReservation;