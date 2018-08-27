import React, { Component } from 'react';
import {Button, Card, CardActions, CardContent, Grid, Typography} from 'material-ui';
import { withStyles } from 'material-ui/styles';
import './App.css';

const styles = theme => ({
  group : {
    marginLeft: theme.spacing.unit * 230,
  }
})

class Home extends Component {
  constructor (props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Grid container xs={12} justify="center" className="portal">
          <Grid item sm={4}>
            <Card>
              <CardContent>
                <Typography type="title">
                  Developer Portal
                </Typography>
                <Typography type="body1">
                  Make SQL queries to our database • Must have password
                </Typography>
              </CardContent>
              <CardActions>
                <Button onClick={()=>{this.props.changePage('devportal')}} color="accent" raised>ENTER PORTAL</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item sm={4}>
            <Card>
              <CardContent>
                <Typography type="title">
                  Railroad Portal
                </Typography>
                <Typography type="body1">
                  Make, manage and cancel bookings • For Project Use Only
                </Typography>
              </CardContent>
              <CardActions>
                <Button onClick={()=>{this.props.changePage('railroad')}} color="primary" raised>ENTER PORTAL</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default Home;
