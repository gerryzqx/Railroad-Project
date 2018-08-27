import React, {Component} from 'react';
import {Button, 
        Card, 
        CardContent, 
        CardActions, 
        CardHeader,
        ExpansionPanel,
        ExpansionPanelSummary,
        ExpansionPanelDetails,
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableRow, 
        TextField, 
        Typography} from 'material-ui';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import io from 'socket.io-client';

class DevPortal extends Component {
    constructor (props) {
        super(props);
        this.state={
            queries: '',
            password: '',
            resultType: 'empty',
            results: null,
            errorCode: ''
        };
        this.socket = io('http://35.190.187.221:3000');        
        this.makeQuery = this.makeQuery.bind(this);
        this.clear = this.clear.bind(this);
    }
    componentDidMount() {
        this.socket.on('query_result', (data)=>{
            console.log(data);
            if (data.code) {
                this.setState({
                    resultType: 'error',
                    errorCode: data.code
                })
            } else if (data.info) {
                this.setState({
                    resultType: 'info',
                    results: data
                })
            } else {
                if (data.length === 0) {
                    this.setState({
                        resultType: 'emptytable'
                    })
                } else {
                    var count = 0;
                    for ( ; count < data.length; count++) {
                        if (Array.isArray(data[count])){
                            break;
                        }
                    }
                    if (count === data.length) {
                        // singlequery
                        if (data.code) {
                            // singlequery & error
                            this.setState({
                                resultType: 'error',
                                errorCode: data.code
                            })
                        } else {
                            // singlequery & results
                            this.setState({
                                resultType: 'single',
                                results: data
                            })
                        }
                    } else {
                        // multiquery
                        this.setState({
                            resultType: 'multiple',
                            results: data
                        })
                    }
                }
            }
        })
    }
    componentWillUnmount() {
        this.socket.disconnect();
    }
    makeQuery () {
        this.socket.emit('query',{
            sql:this.state.queries, 
            password:this.state.password
        });
    }
    clear() {
        this.setState({
            queries: '',
            password: '',
            resultType: 'empty',
            results: null,
            errorCode: ''
        })
    }
    render () {
        return (
            <div>
                <Card>
                    <CardHeader
                        title="SQL Queries"
                        subheader="End queries by semicolon (;)"
                    />
                    <CardContent>
                        <TextField
                            className="query-box"
                            value={this.state.queries}
                            onChange={(val)=>{this.setState({queries:val.target.value})}}
                            rows={10}
                            rowsMax={10}
                            required multiline
                            inputClassName="queries"
                            placeholder="Enter queries here..."
                        />
                        <Typography type="body3" className="password-title">
                            Password
                        </Typography>
                        <TextField
                            className="query-box"
                            value={this.state.password}
                            onChange={(val)=>{this.setState({password:val.target.value})}}
                            type="password"
                            placeholder="Developer Password"
                        />
                    </CardContent>
                    <CardActions>
                        <Button color="accent" onClick={()=>{this.makeQuery()}} raised dense>
                            EXECUTE
                        </Button>
                        <Button onClick={()=>{this.clear()}} color="inherit" dense>
                            CLEAR
                        </Button>
                    </CardActions>
                </Card>
                <Card className="result-card">
                    <CardHeader 
                        title="Results"
                        subheader="Your query results will be populate below"
                    />
                    <CardContent className="result-card-table">
                    {
                        this.state.resultType === 'empty' ?
                        <Typography type="body1">
                            Nothing to show yet.
                        </Typography>:
                        this.state.resultType === 'error' ?
                        <Typography type="body1" className="error">
                            Something went wrong, check your query...
                            <br />
                            If there were multiple queries, your first query has the error.
                            <br />
                            Error Code to lookup: <span className="code">{this.state.errorCode}</span>
                            <br />
                            Error codes here:&nbsp;
                            <a href="https://mariadb.com/kb/en/library/mariadb-error-codes/">
                                https://mariadb.com/kb/en/library/mariadb-error-codes/
                            </a>
                        </Typography>:
                        this.state.resultType === 'emptytable' ?
                        <Typography type="body1" className="error">
                            That's an empty table.
                            <br />
                            Try DESCRIBE [TABLE_NAME]; to see the columns.
                        </Typography>:
                        this.state.resultType === 'single' ?
                        <ResultTable data={this.state.results} />:
                        this.state.resultType === 'multiple' ?
                        <div>
                        {
                            this.state.results.map((data,index)=>{
                                return (
                                    data.length === 0 ?
                                    <ExpansionPanel key={`result${index}`}>
                                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography type="body1">
                                                Result {index}
                                            </Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <Typography type="body1" className="error">
                                                That's an empty table.
                                                <br />
                                                Try DESCRIBE [TABLE_NAME]; to see the columns.
                                            </Typography>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>:
                                    data.code ? 
                                    <ExpansionPanel key={`result${index}`}>
                                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography type="body1">
                                                Result {index}
                                            </Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                        <Typography type="body1" className="error">
                                            Something went wrong, check your query...
                                            <br />
                                            Error Code to lookup: <span className="code">{data.code}</span>
                                            <br />
                                            Error codes here:&nbsp;
                                            <a href="https://mariadb.com/kb/en/library/mariadb-error-codes/">
                                                https://mariadb.com/kb/en/library/mariadb-error-codes/
                                            </a>
                                        </Typography>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>:
                                    data.info ?
                                    <ExpansionPanel key={`result${index}`}>
                                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography type="body1">
                                                Result {index}
                                            </Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <Typography type="body1" className="info">
                                                Successfully completed your query, here's what the server returned
                                                <br />
                                                {JSON.stringify(data)}
                                            </Typography>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>:
                                    <ExpansionPanel key={`result${index}`}>
                                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography type="body1">
                                                Result {index}
                                            </Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails  className="result-table">
                                            <ResultTable data={data} />
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                );
                            })
                        }</div>:
                        this.state.resultType === 'info'?
                        <Typography type="body1" className="info">
                            Successfully completed your query, here's what the server returned
                            <br />
                            {JSON.stringify(this.state.results)}
                        </Typography>:
                        null
                    }
                    </CardContent>
                </Card>
            </div>
        );
    }
}

export default DevPortal;

function ResultTable (props) {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    {
                        Object.keys(props.data[0]).map((key, index)=>{
                            return(
                                <TableCell key={`${key}-${index}`}>
                                    {key}
                                </TableCell>
                            );
                        })
                    }
                </TableRow>
            </TableHead>
            <TableBody>
                    {
                        props.data.map((data, index)=>{
                            return(
                                <TableRow key={`${index}`}>
                                    {
                                        Object.keys(data).map((key, obInd)=>{
                                            return(
                                                <TableCell key={`${index}-${key}`}>
                                                    {data[key]}
                                                </TableCell>
                                            );
                                        })
                                    }
                                </TableRow>
                            );
                        })
                    }
            </TableBody>
        </Table>
    );
}