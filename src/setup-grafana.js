'use strict';

const DashboardOperations = require('./dashboard-operations');
const GrafanaOperations = require('./grafana-operations');

const setupGrafana = async function (options) {
    const grafanaOperations = new GrafanaOperations(options.grafana);
    const dashboadOperations = new DashboardOperations();
    
    const dashboardObject = await dashboadOperations.generateDashboard(options.dashboardTemplateId, options.formId);

    const esDatasourceOptions = {
        name: `es-survey-${options.formId}`.toLowerCase(),
        type: 'elasticsearch',
        access: 'proxy',
        url: 'http://elk:9200',
        database: `survey-${options.formId}`.toLowerCase(),
        basicAuth: false,
        jsonData: {
            esVersion: 70,
            maxConcurrentShardRequests: 256,
            timeField: 'landed'
        }
    };

    await grafanaOperations.createDatasource(esDatasourceOptions);
    await grafanaOperations.createDashboard(dashboardObject);
}

const main = async function () {
    if (process.argv.length < 7) {
        console.warn('-- usage setup-grafana {TEMPLATEID} {FORMID} {GRAFANA_URL} {GRAFANA_USER} {GRAFANA_PASS}');
        return;
    }

    const options = {
        dashboardTemplateId: process.argv[2],
        formId: process.argv[3],
        grafana: {
            url: process.argv[4],
            user: process.argv[5],
            pass: process.argv[6]
        }
    };

    await setupGrafana(options);

    console.info(`done generate-dashboard`);
}

main();