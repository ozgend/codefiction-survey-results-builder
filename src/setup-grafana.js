const DashboardOperations = require('./dashboard-operations');
const GrafanaOperations = require('./grafana-operations');

const setupGrafana = async options => {
  const grafanaOperations = new GrafanaOperations(options.grafana);
  const dashboadOperations = new DashboardOperations();

  const dashboardObject = await dashboadOperations.generateDashboard(
    options.dashboardTemplateId,
    options.formId
  );

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
};

module.exports.setupGrafanaProcessor = async ({
  dashboardTemplateId,
  formId,
  url,
  user,
  pass
}) => {
  const options = {
    dashboardTemplateId,
    formId,
    grafana: {
      url,
      user,
      pass
    }
  };

  await setupGrafana(options);

  console.info(`done generate-dashboard`);
};
