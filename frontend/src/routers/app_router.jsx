import React from "react";
import Router from "react-router";
let { Route, DefaultRoute, RouteHandler } = Router;

import MainPage from "../pages/main/main_page";


export default class AppRouter extends React.Component {
  render() {
    return (
      <div id="container">
        <div id="main">
          <RouteHandler {...this.props} />
        </div>
      </div>
    );
  }
}

AppRouter.getRoutes = function() {
  return (
    <Route name="app" path="/config/" handler={AppRouter}>
      <DefaultRoute name="main" handler={MainPage} />
    </Route>
  );
}
