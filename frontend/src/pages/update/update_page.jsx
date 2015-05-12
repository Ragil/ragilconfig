import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import env from 'env';


export default class UpdatePage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      data : {
        namespace : this.props.namespace
      }
    };
    this.fetchData(props);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchData(nextProps);
  }

  fetchData(props) {
    $.ajax(env.service.config, {
      data : {
        namespace : props.namespace
      }
    }).done(((data, status, jqXHR) => {
      this.setState({
        data : data
      });
    }).bind(this));
  }

  update(e) {
    e.preventDefault();

    this.updateState();

    console.log(this.state.data);
    $.ajax(env.service.config, {
      contentType : 'application/json; charset=UTF-8',
      data : JSON.stringify(this.state.data),
      method : 'POST'
    }).done(((data, status, jqXHR) => {
      this.setState({
        data : data
      });
    }).bind(this));
  }

  updateState() {
    let props = {};
    _.each($('.props'), (propEl) => {
      let key = $(propEl).find('.prop-key').val();
      let val = $(propEl).find('.prop-value').val();

      props[key] = val;
    });

    let payload = {
      namespace : $('.prop-namespace').val(),
      username : $('.prop-username').val(),
      password : $('.prop-password').val(),
      props : props
    };

    this.setState({
      data : payload
    });
  }

  addProp(e) {
    e.preventDefault();

    this.setState({
      data : _.extend(this.state.data, {
        props : _.extend(this.state.data.props, {'new' : 'prop'})
      })
    });
  }

  render() {
    let entries = [];
    let index = 0;

    _.each(this.state.data.props, (value, key) => {
      entries.push((
        <div className="form-group col-sm-12 props" key={index++}>
          <label className='col-sm-1'>Key:</label>
          <div className="col-sm-4">
            <input type="text" className="form-control prop-key"
                value={key} onChange={this.updateState.bind(this)}/>
          </div>

          <label className='col-sm-1'>Value:</label>
          <div className="col-sm-4">
            <input type="text" className="form-control prop-value"
                value={value} onChange={this.updateState.bind(this)}/>
          </div>
        </div>
      ));
    });

    return (
      <div className="update-page row">
        <form>
          <div className="form-group col-sm-12">
            <label className="col-sm-1">Namespace</label>
            <div className="col-sm-4">
              <input type="text" className="form-control prop-namespace"
                  value={this.state.data.namespace}
                  onChange={this.updateState.bind(this)} />
            </div>
          </div>

          <div className="form-group col-sm-12">
            <label className="col-sm-1">Username</label>
            <div className="col-sm-4">
              <input type="text" className="form-control prop-username"
                  value={this.state.data.username}
                  onChange={this.updateState.bind(this)} />
            </div>
          </div>

          <div className="form-group col-sm-12">
            <label className="col-sm-1">Password</label>
            <div className="col-sm-4">
              <input type="text" className="form-control prop-password"
                  value={this.state.data.password}
                  onChange={this.updateState.bind(this)} />
            </div>
          </div>

          {entries}

          <div className="form-group col-sm-12">
            <div className="col-sm-offset-1"></div>
            <div className="col-sm-4">
              <button className="btn btn-primary"
                  onClick={this.update.bind(this)}>Update</button>
            </div>
            <div className="col-sm-1">
              <button className="btn btn-primary"
                  onClick={this.addProp.bind(this)}>+</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
