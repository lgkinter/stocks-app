import React, { Component } from "react";
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import "./Signup.css";
import {
    AuthenticationDetails,
    CognitoUserPool
} from "amazon-cognito-identity-js";
import config from "../config";

export default class Signup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            email: "",
            password: "",
            confirmPassword: "",
            confirmationCode: "",
            newUser: null
        };
    }

    validateForm() {
        return (
            this.state.email.length > 0 &&
            this.state.password.length > 0 &&
            this.state.password === this.state.confirmPassword
        );
    }

    validateConfirmationForm() {
        return this.state.confirmationCode.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    };

    handleSubmit = async event => {
        event.preventDefault();

        this.setState({ isLoading: true });

        try {
            const newUser = await this.signup(this.state.email, this.state.password);
            this.setState({
                newUser: newUser
            });
        } catch (e) {
            alert(e);
        }

        this.setState({ isLoading: false });
    };

    handleConfirmationSubmit = async event => {
        event.preventDefault();

        this.setState({ isLoading: true });

        try {
            await this.confirm(this.state.newUser, this.state.confirmationCode);
            await this.authenticate(
                this.state.newUser,
                this.state.email,
                this.state.password
            );

            this.props.userHasAuthenticated(true);
            this.props.history.push("/");
        } catch (e) {
            alert(e);
            this.setState({ isLoading: false });
        }
    };

    signup(email, password) {
        const userPool = new CognitoUserPool({
            UserPoolId: config.cognito.USER_POOL_ID,
            ClientId: config.cognito.APP_CLIENT_ID
        });

        return new Promise((resolve, reject) =>
            userPool.signUp(email, password, [], null, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result.user);
            })
        );
    }

    confirm(user, confirmationCode) {
        return new Promise((resolve, reject) =>
            user.confirmRegistration(confirmationCode, true, function(err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            })
        );
    }

    authenticate(user, email, password) {
        const authenticationData = {
            Username: email,
            Password: password
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);

        return new Promise((resolve, reject) =>
            user.authenticateUser(authenticationDetails, {
                onSuccess: result => resolve(),
                onFailure: err => reject(err)
            })
        );
    }

    renderConfirmationForm() {
        return (
            <form onSubmit={this.handleConfirmationSubmit}>
                    <TextField
                        required
                        id="confirmationCode"
                        label="Confirmation Code"
                        onChange = {this.handleChange}
                        margin="normal"
                    />
                    <p>Please check your email for the code.</p>
                <Button
                    raised
                    color="primary"
                    disabled={!this.validateConfirmationForm()}
                    type="submit">
                    Verify
                </Button>
            </form>
        );
    }

    renderForm() {
        return (
            <form onSubmit={this.handleSubmit}>
                <TextField
                    required
                    id="email"
                    label="Email"
                    onChange = {this.handleChange}
                    margin="normal"
                />
                <br/>
                <TextField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    onChange = {this.handleChange}
                />
                <br/>
                <TextField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    onChange = {this.handleChange}
                />
                <br/>
                <Button
                    raised
                    color="primary"
                    disabled={!this.validateForm()}
                    type="submit">
                    Signup
                </Button>
            </form>
        );
    }

    render() {
        return (
            <div className="Signup">
                {this.state.newUser === null
                    ? this.renderForm()
                    : this.renderConfirmationForm()}
            </div>
        );
    }
}