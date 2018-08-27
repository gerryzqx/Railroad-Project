import React, {Component} from 'react';
import {Grid,
        AppBar,
        Toolbar,
        Button, 
        Card, 
        CardActions, 
        CardContent, 
        CardHeader,
        CardMedia,
        Drawer,
        IconButton,
        Snackbar,
        Typography
    } from 'material-ui';
import CloseIcon from 'material-ui-icons/Close';
import NewPassenger from './NewPassenger.js';
import NewReservation from './NewReservation.js';
import CheckReservation from './CheckReservation.js';
import CheckStatus from './CheckStatus.js';

class Railroad extends Component {
    constructor (props) {
        super (props);
        this.state = {
            toShow: '',
            openDrawer: false,
            notify:false,
            notifyMsg: ''
        }
        this.openChoice = this.openChoice.bind(this);
        this.closeChoice = this.closeChoice.bind(this);
        this.notify = this.notify.bind(this);
    }
    openChoice(typeChoice) {
        this.setState({
            toShow: typeChoice,
            openDrawer: true
        })
    }
    closeChoice() {
        this.setState({
            openDrawer: false
        })
    }
    notify(message){
        this.setState({
            notify:true,
            notifyMsg: message
        })
    }
    render () {
        return (
            <div>
                <Grid container justify="center" spacing={24} className="grid-cont">
                    <Grid item xs={12} sm={6}>
                    <Card>
                        <CardHeader title="Make New Reservation" />
                        <CardContent>
                            <Typography type="body1">
                                Plan your trip and reserve your tickets.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button onClick={()=>{this.openChoice('newR')}} color="accent" raised dense>
                                Go
                            </Button>
                        </CardActions>
                    </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                    <Card>
                        <CardHeader title="Passenger Sign Up" />
                        <CardContent>
                            <Typography type="body1">
                                Sign-up now and plan your next trip online. 
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button onClick={()=>{this.openChoice('newP')}} color="accent" raised dense>
                                Go
                            </Button>
                        </CardActions>
                    </Card>
                    </Grid>
                </Grid>
                <Grid container justify="center" spacing={24} className="grid-cont">                
                    <Grid item xs={12} sm={6}>
                    <Card>
                        <CardHeader title="Check Reservation" />
                        <CardContent>
                            <Typography type="body1">
                                Lost your ticket? Need to cancel?
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button onClick={()=>{this.openChoice('checkR')}} color="accent" raised dense>
                                Go
                            </Button>
                        </CardActions>
                    </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                    <Card>
                        <CardHeader title="Check Train Status" />
                        <CardContent>
                            <Typography type="body1">
                                Check train timings - delays and early arrivals.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button onClick={()=>{this.openChoice('checkS')}} color="accent" raised dense>
                                Go
                            </Button>
                        </CardActions>
                    </Card>
                    </Grid>
                </Grid>
                <Drawer
                    anchor="bottom"
                    open={this.state.openDrawer}
                    onRequestClose={()=>{this.closeChoice()}}
                >
                    <AppBar position="static" color="default">
                        <Toolbar>
                            <IconButton color="primary" aria-label="Close" onClick={()=>{this.setState({openDrawer:false})}}>
                                <CloseIcon />
                            </IconButton>
                            <Typography type="title">
                                {
                                    this.state.toShow === 'newR'? 'New Reservation':
                                    this.state.toShow === 'newP'? 'Passenger Sign-Up':
                                    this.state.toShow === 'checkR'? 'Check Reservation':
                                    this.state.toShow === 'checkS' ? 'Check Train Status':
                                    'Error'
                                }
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    {
                        this.state.toShow === 'newP' ?
                        <NewPassenger notify={this.notify} back={()=>{this.closeChoice()}} />:
                        this.state.toShow === 'newR' ?
                        <NewReservation notify={this.notify} back={()=>{this.closeChoice()}} />:
                        this.state.toShow === 'checkR' ?
                        <CheckReservation notify={this.notify} back={()=>{this.closeChoice()}}/>:
                        this.state.toShow === 'checkS' ?
                        <CheckStatus notify={this.notify} back={()=>{this.closeChoice()}}/>:
                        null
                    }
                </Drawer>
                <Snackbar
                    anchorOrigin={{vertical:'bottom',horizontal:'left'}}
                    open={this.state.notify}
                    onRequestClose={()=>{this.setState({notify:false,notifyMsg:''})}}
                    message={<span>{this.state.notifyMsg}</span>}
                    autoHideDuration={1500}
                />
            </div>
        );
    }
}

export default Railroad;