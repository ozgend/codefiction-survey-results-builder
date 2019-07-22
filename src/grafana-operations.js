'use strict';

const GrafanaApi = require('jsgrafana');

class GrafanaOperations {
  constructor(options) {
    this._api = new GrafanaApi(options.url, options.user, options.pass);
  }

  async createDatasource(options) {
    try {
      const result = await this._api.perform('createDatasource', options);
      return result;
    } catch (error) {
      if (error.message === 'Data source with same name already exists') {
        console.debug(' --- datasource exists, skipping');
      } else {
        console.error(error);
        throw error;
      }
    }
  }

  async createDashboard(dashboard) {
    try {
      const result = await this._api.perform('setDashboard', { dashboard });
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = GrafanaOperations;
