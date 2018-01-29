import React, { Component } from "react";
import config from "../config";
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import "./Login.css";
import {
    CognitoUserPool,
    AuthenticationDetails,
    CognitoUser
} from "amazon-cognito-identity-js";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    }
});

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            email: "",
            password: ""
        };
    }

    validateForm() {
        return this.state.email.length > 0 && this.state.password.length > 0;
    }

    login(email, password) {
        const userPool = new CognitoUserPool({
            UserPoolId: config.cognito.USER_POOL_ID,
            ClientId: config.cognito.APP_CLIENT_ID
        });
        const user = new CognitoUser({ Username: email, Pool: userPool });
        const authenticationData = { Username: email, Password: password };
        const authenticationDetails = new AuthenticationDetails(authenticationData);

        return new Promise((resolve, reject) =>
            user.authenticateUser(authenticationDetails, {
                onSuccess: result => resolve(),
                onFailure: err => reject(err)
            })
        );
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
            await this.login(this.state.email, this.state.password);
            this.props.userHasAuthenticated(true);
            this.props.history.push("/");
        } catch (e) {
            alert(e);
            this.setState({ isLoading: false });
        }
    };

    render() {
        return (
            <div className="Login">
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
                    <br/>
                    <Button
                        raised
                        color="primary"
                        disabled={!this.validateForm()}
                        type="submit">
                        Login
                    </Button>
                </form>
            </div>
        );
    }
}
