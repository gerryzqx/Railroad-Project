import React, {Component} from 'react';
import {TextField,
        Button,
        Table,
        TableHead,
        TableBody,
        TableRow,
        TableCell,
        FormControl,
        Input,
        InputLabel,
        Select,
        MenuItem,
    } from 'material-ui';
import io from 'socket.io-client';
import './App.css';
import { dark } from 'material-ui/styles/createPalette';

class CheckStatus extends Component{
    constructor(props){
        super(props);
        this.state={
            sid:'',
            fallback:'',
            trains: null,
            stationList: [{station_id:1,station_name:'Loading stations...'}]
        }
        this.socket = io('http://35.190.187.221:3000');
        this.socket.emit('get_station',{});
        this.getTrainTimings = this.getTrainTimings.bind(this);
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
        this.socket.on('query_result', (data)=>{
            if (data.code || data.info) this.props.notify('Oops... looks like something went wrong :/');
            else {
                this.setState({
                    trains: data
                })
            }
        })
    }
    getTrainTimings() {
        if (this.state.sid !== '')
        this.socket.emit('query',{
            sql: `select * from stops_at where station_id=${this.state.sid}`,
            password: 'team7336'
        })
        else this.props.notify('Please select a station first.')
    }
    render() {
        return(
            <div style={{padding:36}} className="check-station">
                <FormControl className="selector">
                    <InputLabel htmlFor="from-station">
                        Station
                    </InputLabel>
                    <Select
                        input={<Input name="from" id="from-station" />}
                        value={this.state.sid}
                        onChange={(e)=>{
                            this.setState({sid:e.target.value})
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
                    <Button
                        className="see-train-btn"
                        raised
                        color="primary"
                        onClick={()=>{this.getTrainTimings()}}
                    >
                        check timings
                    </Button>
                </FormControl>
                {
                    this.state.trains?
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Train ID</TableCell>
                                <TableCell>Arrival</TableCell>
                                <TableCell>Departure</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.state.trains.map((data,index)=>{
                                    return(
                                        <TableRow key={`train${index}`}>
                                            <TableCell>{data.train_id}</TableCell>
                                            <TableCell>{data.time_in}</TableCell>
                                            <TableCell>{data.time_out}</TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>:
                    null
                }
            </div>
        );
    }
}

export default CheckStatus;