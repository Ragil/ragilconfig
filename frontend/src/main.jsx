/**
 * App entry point
 */

// Polyfill
import "babel-core/polyfill";

// Libraries
import React from "react";
import Router from "react-router";

// Routers
import AppRouter from "./routers/app_router";


// ID of the DOM element to mount app on
const DOM_APP_EL_ID = "app";


// Initialize routes depending on session
let routes = AppRouter.getRoutes();

// Start the router
Router.run(routes, Router.HistoryLocation, function(Handler, state) {
  React.render(<Handler />, document.getElementById(DOM_APP_EL_ID));
});
