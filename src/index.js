// Read dotenv config
require('dotenv').config();

const { parseQuestionsProcessor } = require('./parse-questions');
const { parseResultsProcessor } = require('./parse-results');
const { seedElkProcessor } = require('./seed-elasticsearch');
const { setupGrafanaProcessor } = require('./setup-grafana');

const runSequence = async () => {
  await parseQuestionsProcessor({
    apiKey: process.env.APIKEY,
    formId: process.env.FORMID
  });
  await parseResultsProcessor({
    apiKey: process.env.APIKEY,
    formId: process.env.FORMID,
    token: process.env.TOKEN,
    direction: process.env.DIRECTION
  });
  await seedElkProcessor({
    esHost: process.env.ESHOST,
    formId: process.env.FORMID
  });
  await setupGrafanaProcessor({
    dashboardTemplateId: process.env.TEMPLATEID,
    formId: process.env.FORMID,
    pass: process.env.GRAFANA_PASS,
    user: process.env.GRAFANA_USER,
    url: process.env.GRAFANA_URL
  });
};

runSequence().then(_ => {
  console.log('Done');
});
