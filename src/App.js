import React, {Component} from 'react';
import Home from './Home.js';
import DevPortal from './DevPortal.js';
import Railroad from './Railroad.js';
import {AppBar, Button, Toolbar, Typography} from 'material-ui';

class App extends Component{
    constructor (props) {
        super(props);
        this.state= {
            page: 'home'
        }
        this.pageChanger = this.pageChanger.bind(this);
    }
    pageChanger (pageName) {
        this.setState({
            page: pageName
        })
    }
    render() {
        return (
            <div>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <Typography type="title" color="inherit">
                            RAILROAD
                        </Typography>
                        <Typography className='group' type="subheading" color="inherit">
                            CSC 33600 - G [TEAM 7]
                        </Typography>
                        {
                            this.state.page === 'home' ? null:
                            <Button
                                raised
                                onClick={()=>{this.pageChanger('home')}}
                                color='primary'
                            >
                                GO HOME
                            </Button>
                        }
                    </Toolbar>
                </AppBar>
                {
                    this.state.page === 'home'?
                    <Home changePage={this.pageChanger}/>:
                    this.state.page === 'devportal'?
                    <DevPortal changePage={this.pageChanger} />:
                    this.state.page === 'railroad'?
                    <Railroad changePage={this.pageChanger} />:
                    null
                }
            </div>
        );
    }
}

export default App;