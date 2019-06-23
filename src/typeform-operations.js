'use strict';

const typeformApi = require('@typeform/api-client');

class TypeformOperations {
    constructor(token) {
        this._api = typeformApi.createClient({ token: token });
    }

    async getForms(options) {
        options = options || {};
        const result = await this._api.forms.list(options);
        return result;
    }

    async getForm(options) {
        const result = await this._api.forms.get(options);
        return result;
    }

    async getResults(options) {
        const result = await this._api.responses.list(options);
        return result;
    }
}

module.exports = TypeformOperations;