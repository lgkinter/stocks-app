import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';

import EnhancedTable from './Table';
import Inputs from './Inputs';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 40,
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      num_stocks: 20,
      total_amount: 15000
    };
    this.onChange = this.onChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onChange(num_stocks, total_amount) {
    this.setState({ num_stocks, total_amount }, () => this.callApi());
  }

  onDelete(symbol) {
    fetch(
      'https://6rojikg4b0.execute-api.us-east-1.amazonaws.com/dev/exclusionlist/deletesymbol',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol })
      }
    ).then(results => {
      console.log(results);
      this.callApi();
    });
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
      .then(results => results.json())
      .then(data => {
        let total = this.state.total_amount;
        let amount_left = total;
        data.forEach((d, i) => {
          d.id = i;
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
          ).toFixed(2);
          d.shares_to_buy = Math.round(d.total_cost / d.sale_price);
          amount_left -= d.total_cost;
          fetch(`https://api.robinhood.com/fundamentals/${d.symbol}/`)
            .then(results => results.json())
            .then(detailData => (d.details = detailData));
        });
        this.setState({ data });
      });
  }

  render() {
    const { classes } = this.props;
    const props = { classes, onDelete: this.onDelete };
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} lg={12}>
            <Inputs {...this.state} onChange={this.onChange} />
            <EnhancedTable {...props} {...this.state} />
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
