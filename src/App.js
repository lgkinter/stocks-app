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
    margin: '40px auto',
    maxWidth: '1050px',
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      width: Math.min(window.innerWidth, 1050),
      num_stocks: 20,
      total_amount: 15000,
      small: true,
      medium: true,
      large: true,
      basic_industries: true,
      capital_goods: true,
      consumer_nondurables: true,
      consumer_durables: true,
      consumer_services: true,
      energy: true,
      finance: true,
      health_care: true,
      public_utilities: true,
      transportation: true,
      technology: true,
      miscellaneous: true
    };
    this.onChange = this.onChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  onChange(field, value) {
    this.setState({ [field]: value }, () => this.callApi());
  }

  onDelete(symbol) {
    // fetch(
    //   'https://6rojikg4b0.execute-api.us-east-1.amazonaws.com/dev/getmetricsbysymbol/?symbol=BBY'
    // )
    //   .then(results => results.json())
    //   .then(data => {
    //     console.log(data);
    //   });

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
  componentWillMount() {
    this.callApi();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  updateDimensions() {
    const updated_width = Math.min(window.innerWidth, 1050);
    this.setState({ width: updated_width });
  }

  callApi() {
    let queryParams = `?dollars=${this.state.total_amount}&size=${
      this.state.num_stocks
    }`;
    if (this.state.small) queryParams += `&marketcap=small`;
    if (this.state.medium) queryParams += `&marketcap=medium`;
    if (this.state.large) queryParams += `&marketcap=large`;
    if (this.state.basic_industries) queryParams += `&sector=basic+industries`;
    if (this.state.capital_goods) queryParams += `&sector=capital+goods`;
    if (this.state.consumer_nondurables)
      queryParams += `&sector=consumer+non-durables`;
    if (this.state.consumer_durables)
      queryParams += `&sector=consumer+durables`;
    if (this.state.consumer_services)
      queryParams += `&sector=consumer+services`;
    if (this.state.energy) queryParams += `&sector=energy`;
    if (this.state.finance) queryParams += `&sector=finance`;
    if (this.state.health_care) queryParams += `&sector=health+care`;
    if (this.state.public_utilities) queryParams += `&sector=public+utilities`;
    if (this.state.transportation) queryParams += `&sector=transportation`;
    if (this.state.technology) queryParams += `&sector=technology`;
    if (this.state.miscellaneous) queryParams += `&sector=miscellaneous`;

    fetch(
      `https://6rojikg4b0.execute-api.us-east-1.amazonaws.com/dev/getvaluetable${queryParams}`
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
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error(d.symbol + ' symbol is not found');
            })
            .then(detailData => (d.details = detailData))
            .catch(error => {
              console.log(
                'There has been a problem with Robinhood API: ',
                error.message
              );
            });
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
