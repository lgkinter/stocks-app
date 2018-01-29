import React, { Component } from 'react';
import '../App.css';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';

import EnhancedTable from '../Table';
import Inputs from '../Inputs';
import {authUser} from "../libs/awsLib";

const styles = theme => ({
    root: {
        flexGrow: 1,
        margin: '40px auto',
        maxWidth: '1100px',
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 3
    }
});

const industries = [
    'basic_industries',
    'capital_goods',
    'consumer_nondurables',
    'consumer_durables',
    'consumer_services',
    'energy',
    'finance',
    'health_care',
    'public_utilities',
    'transportation',
    'technology',
    'miscellaneous'
];

export default class ValueTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            width: Math.min(window.innerWidth, 1100),
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
        if (field === 'industries' && value === 'all') {
            let updateIndustries = {};
            industries.forEach(industry => (updateIndustries[industry] = true));
            this.setState(updateIndustries, () => this.callApi());
        } else if (field === 'industries' && value === 'none') {
            let updateIndustries = {};
            industries.forEach(industry => (updateIndustries[industry] = false));
            this.setState(updateIndustries, () => this.callApi());
        } else {
            this.setState({ [field]: value }, () => this.callApi());
        }
    }

    onDelete(symbol) {
        fetch(
            'https://6rojikg4b0.execute-api.us-east-1.amazonaws.com/prod/exclusionlist/insertsymbol',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symbol })
            }
        ).then(results => this.callApi());
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
        const updated_width = Math.min(window.innerWidth, 1100);
        this.setState({ width: updated_width });
    }

    callApi() {
        let market_cap_arr = [];
        if (this.state.small) market_cap_arr.push('small');
        if (this.state.medium) market_cap_arr.push('medium');
        if (this.state.large) market_cap_arr.push('large');
        //if (market_cap_arr.length === 3) market_cap_arr = [];
        if (market_cap_arr.length === 3) {
            market_cap_arr = [];
        } else if (market_cap_arr.length === 0) {
            market_cap_arr = ['none'];
        }

        let industry_arr = [];
        if (this.state.basic_industries) industry_arr.push('basic+industries');
        if (this.state.capital_goods) industry_arr.push('capital+goods');
        if (this.state.consumer_nondurables)
            industry_arr.push('consumer+non-durables');
        if (this.state.consumer_durables) industry_arr.push('consumer+durables');
        if (this.state.consumer_services) industry_arr.push('consumer+services');
        if (this.state.energy) industry_arr.push('energy');
        if (this.state.finance) industry_arr.push('finance');
        if (this.state.health_care) industry_arr.push('health+care');
        if (this.state.public_utilities) industry_arr.push('public+utilities');
        if (this.state.transportation) industry_arr.push('transportation');
        if (this.state.technology) industry_arr.push('technology');
        if (this.state.miscellaneous) industry_arr.push('miscellaneous');
        if (industry_arr.length === 12) {
            industry_arr = [];
        } else if (industry_arr.length === 0) {
            industry_arr = ['none'];
        }

        let queryParams = `?dollars=${this.state.total_amount}&size=${
            this.state.num_stocks
            }`;
        if (market_cap_arr.length > 0)
            queryParams += `&marketcap=${market_cap_arr.join()}`;
        if (industry_arr.length > 0)
            queryParams += `&sector=${industry_arr.join()}`;
        console.log(queryParams);

        fetch(
            `https://6rojikg4b0.execute-api.us-east-1.amazonaws.com/prod/getvaluetable${queryParams}`
        )
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
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
            })
            .catch(error => {
                console.log('Incorrect parameters');
                this.setState({ data: [] });
            });
    }

    render() {
        const { classes } = this.props;
        console.log("Classes!?!?!" + classes);
        const props = { classes, onDelete: this.onDelete };
        return (
            <div className="ValueTable">
                <Grid container spacing={24}>
                    <Grid item xs={12} lg={12}>
                        <Inputs
                            {...this.state}
                            onChange={this.onChange}
                            industries={industries}
                        />
                        <EnhancedTable {...props} {...this.state} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}