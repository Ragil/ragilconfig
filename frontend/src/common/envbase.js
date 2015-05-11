import _ from 'lodash'


export default class Env {
  constructor(opts) {
    _.extend(this, opts);

    this.service = {
      config : opts.baseURL + '/admin/config'
    }
  }
};
