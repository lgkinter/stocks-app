import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import ValueTable from "./containers/ValueTable";
import AppliedRoute from "./components/AppliedRoute";

export default ({ childProps }) =>
    <Switch>
        <AppliedRoute  path="/" exact component={Home} props={childProps}/>
        <AppliedRoute  path="/login" exact component={Login} props={childProps}/>
        <AppliedRoute  path="/signup" exact component={Signup} props={childProps} />
        <AppliedRoute  path="/valuetable" exact component={ValueTable} props={childProps} />
    </Switch>;