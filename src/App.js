import React, { Component } from 'react';
import './App.css';
//import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
//import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

import EnhancedTable from './EnhancedTable';
import Inputs from './Inputs';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 40,
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3
  }
  // paper: {
  //   padding: 16,
  //   textAlign: 'center',
  //   color: theme.palette.text.secondary
  // }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      num_stocks: 20,
      total_amount: 15000
    };
  }

  onChange(num_stocks, total_amount) {
    this.setState({ num_stocks, total_amount }, () => this.callApi());
  }

  componentDidMount() {
    this.callApi();
  }

  callApi() {
    fetch(
      `https://6rojikg4b0.execute-api.us-east-1.amazonaws.com/dev/getvaluetable?dollars=${
        this.state.total_amount
      }&size=${this.state.num_stocks}`
    )
      .then(results => {
        return results.json();
      })
      .then(data => {
        let total = this.state.total_amount;
        let amount_left = total;
        data.forEach(d => {
          d.rank = +d.rank;
          d.earnings_yield = parseFloat(d.earnings_yield).toFixed(2);
          d.roic = parseFloat(d.roic).toFixed(2);
          d.value_calc = parseFloat(d.value_calc).toFixed(2);
          d.value_weight = parseFloat(d.value_weight).toFixed(2);
          d.sale_price = parseFloat(d.sale_price).toFixed(2);
          //d.total_cost = parseFloat(d.total_cost).toFixed(2);
          d.total_cost = Math.min(
            Math.ceil(total * d.value_weight / d.sale_price) * d.sale_price,
            Math.floor(amount_left / d.sale_price) * d.sale_price
          );
          d.shares_to_buy = d.total_cost / d.sale_price;
          amount_left -= d.total_cost;
        });
        this.setState({ data });
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} lg={12}>
            <Inputs {...this.state} onChange={this.onChange.bind(this)} />
            <EnhancedTable {...this.props} {...this.state} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
