import React, { Component } from "react";
import "./Home.css";

export default class Home extends Component {
    render() {
        return (
            <div className="Home">
                <div className="lander">
                    <h1>Stocks-App</h1>
                    <p>Value-based Stock Recommendations</p>
                </div>
            </div>
        );
    }
}