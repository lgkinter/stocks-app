import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import Input, { InputLabel } from 'material-ui/Input';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel
} from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';

const WAIT_INTERVAL = 300;

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  formControl: {
    margin: theme.spacing.unit
  }
});

class NumberFormatCustom extends React.Component {
  render() {
    return (
      <NumberFormat
        {...this.props}
        onValueChange={values => {
          this.props.onChange({
            target: {
              id: 'total_amount',
              value: values.value
            }
          });
        }}
        thousandSeparator
        prefix="$"
      />
    );
  }
}

NumberFormatCustom.propTypes = {
  onChange: PropTypes.func.isRequired
};

class Inputs extends Component {
  constructor(props) {
    super(props);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.selectNone = this.selectNone.bind(this);
    this.state = {
      num_stocks: this.props.num_stocks,
      total_amount: `$${this.props.total_amount}`,
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
  }

  componentWillMount() {
    this.timer = null;
  }

  handleCheckbox = name => (e, checked) => {
    this.setState({ [name]: checked }, () =>
      this.props.onChange(name, checked)
    );
  };

  selectNone() {
    let updateIndustries = {};
    this.props.industries.forEach(
      industry => (updateIndustries[industry] = false)
    );
    this.setState(updateIndustries, () =>
      this.props.onChange('industries', 'none')
    );
    //figure out triggerChange
  }

  selectAll() {
    let updateIndustries = {};
    this.props.industries.forEach(
      industry => (updateIndustries[industry] = true)
    );
    this.setState(updateIndustries, () =>
      this.props.onChange('industries', 'all')
    );
  }

  onFieldChange(e) {
    clearTimeout(this.timer);
    const field = e.target.id;
    let value = e.target.value;
    if (field === 'num_stocks') {
      value = value < 0 || !value ? '' : parseFloat(value);
    } else {
      value = parseFloat(value.replace(/\$/g, '')) <= 0 || !value ? '' : value;
    }
    this.setState({ [field]: value });
    if (value !== '') {
      this.timer = setTimeout(
        () => this.triggerChange(field, value),
        WAIT_INTERVAL
      );
    }
  }

  triggerChange(field, value) {
    if (field === 'total_amount') {
      value = value === 0 ? 0 : parseFloat(value.slice(1).replace(/,/g, ''));
    }
    this.props.onChange(field, value);
  }

  render() {
    const { classes } = this.props;

    return (
      <Paper style={{ padding: '20px', backgroundColor: '#eef9fb' }}>
        <h2 id="filter-title">
          <hr id="filter-hr-left" />Filters<hr id="filter-hr-right" />
        </h2>
        <Grid container spacing={24}>
          <Grid item xs={6} sm={3}>
            <FormLabel
              component="legend"
              style={{ marginLeft: '8px', marginBottom: '9px' }}
            >
              Amount
            </FormLabel>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="num_stocks">Number of Stocks</InputLabel>
              <Input
                id="num_stocks"
                type="number"
                min="0"
                step="1"
                value={this.state.num_stocks}
                onChange={this.onFieldChange}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="total_amount">Total Amount</InputLabel>
              <Input
                id="total_amount"
                type="text"
                inputComponent={NumberFormatCustom}
                value={this.state.total_amount}
                onChange={this.onFieldChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Market Cap</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.small}
                      onChange={this.handleCheckbox('small')}
                      value="small"
                    />
                  }
                  label="Small"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.medium}
                      onChange={this.handleCheckbox('medium')}
                      value="medium"
                    />
                  }
                  label="Mid"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.large}
                      onChange={this.handleCheckbox('large')}
                      value="large"
                    />
                  }
                  label="Large"
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={8} sm={7}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                Industries<span id="select-all-group">
                  <span id="select-none" onClick={this.selectNone}>
                    Unselect All
                  </span>|
                  <span id="select-all" onClick={this.selectAll}>
                    Select All
                  </span>
                </span>
              </FormLabel>
              <FormGroup>
                <Grid container spacing={8}>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.basic_industries}
                          onChange={this.handleCheckbox('basic_industries')}
                          value="basic_industries"
                        />
                      }
                      label="Basic Industries"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.consumer_services}
                          onChange={this.handleCheckbox('consumer_services')}
                          value="consumer_services"
                        />
                      }
                      label="Consumer Services"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.public_utilities}
                          onChange={this.handleCheckbox('public_utilities')}
                          value="public_utilities"
                        />
                      }
                      label="Public Utilities"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.capital_goods}
                          onChange={this.handleCheckbox('capital_goods')}
                          value="capital_goods"
                        />
                      }
                      label="Capital Goods"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.energy}
                          onChange={this.handleCheckbox('energy')}
                          value="energy"
                        />
                      }
                      label="Energy"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.transportation}
                          onChange={this.handleCheckbox('transportation')}
                          value="transportation"
                        />
                      }
                      label="Transportation"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.consumer_nondurables}
                          onChange={this.handleCheckbox('consumer_nondurables')}
                          value="consumer_nondurables"
                        />
                      }
                      label="Consumer Nondurables"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.finance}
                          onChange={this.handleCheckbox('finance')}
                          value="finance"
                        />
                      }
                      label="Finance"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.technology}
                          onChange={this.handleCheckbox('technology')}
                          value="technology"
                        />
                      }
                      label="Technology"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.consumer_durables}
                          onChange={this.handleCheckbox('consumer_durables')}
                          value="consumer_durables"
                        />
                      }
                      label="Consumer Durables"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.health_care}
                          onChange={this.handleCheckbox('health_care')}
                          value="health_care"
                        />
                      }
                      label="Health Care"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.miscellaneous}
                          onChange={this.handleCheckbox('miscellaneous')}
                          value="miscellaneous"
                        />
                      }
                      label="Miscellaneous"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(Inputs);
