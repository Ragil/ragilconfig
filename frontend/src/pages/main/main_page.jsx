import React from "react";

import UpdatePage from '../update/update_page';


export default class MainPage extends React.Component {
  componentWillMount() {
  }

  render() {
    return (
      <div id="landing-page" className="container">
        <UpdatePage />
      </div>
    );
  }
}
