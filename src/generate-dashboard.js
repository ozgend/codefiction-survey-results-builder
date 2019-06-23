'use strict';

const fs = require('fs');
const _ = require('lodash');

const loadQuestions = async function (id) {
    const file = `./assets/survey/mapped_questions_${id}.json`;
    const questions = JSON.parse(fs.readFileSync(file));
    console.info(`+ done loading mapped questions: ${file}`);
    return questions;
}

const loadTemplate = async function (id) {
    const file = `./assets/dashboard/dashboard-template-${id}.json`;
    const temp = JSON.parse(fs.readFileSync(file));
    console.info(`+ done loading template: ${file}`);
    return temp;
}

const generatePanel = function (panelTemplate, questionKeys, question, row, col) {
    const panel = JSON.parse(JSON.stringify(panelTemplate));

    panel.gridPos.x = panel.gridPos.w * col;
    panel.gridPos.y = panel.gridPos.h * row;
    panel.id = Date.now() - _.random(10, 1000000, false);
    panel.title = question.title;
    panel.targets[0].bucketAggs[0].field = `responses.${question.order}.answer.keyword`;
    panel.targets[0].query = questionKeys.map(q => `responses.${q}.answer:\${${q}:lucene}`).join(' AND ');

    return panel;
}

const generateVariable = function (variableTemplate, question) {
    const query = `{\"find\": \"terms\", \"field\": \"responses.${question.order}.answer.keyword\"}`;
    const variable = JSON.parse(JSON.stringify(variableTemplate));

    variable.definition = query;
    variable.query = query;
    variable.name = question.order;
    variable.label = question.title;

    return variable;
}

const generateDashboard = async function (dashboardTemplateId, formId) {
    const questions = await loadQuestions(formId);
    const questionMap = _.keyBy(questions, 'order');
    const questionKeys = Object.keys(questionMap);
    const dashboardTemplate = await loadTemplate(dashboardTemplateId);

    const identifier = `${dashboardTemplateId}_${formId}_${new Date().toISOString().replace(/:/g, '-').split('.')[0]}_${_.random(1000, 9999, false)}`;

    const dashboard = JSON.parse(JSON.stringify(dashboardTemplate));
    dashboard.panels = [];
    dashboard.templating.list = [];
    dashboard.id = 99;
    dashboard.uid = identifier;
    dashboard.title = identifier;

    let row = 0;
    questionKeys.forEach(qKey => {
        let col = 0;
        dashboardTemplate.panels.forEach(temp => {
            const generatedPanel = generatePanel(temp, questionKeys, questionMap[qKey], row, col);
            dashboard.panels.push(generatedPanel);
            col++;
        });

        row++;

        const generatedVariable = generateVariable(dashboardTemplate.templating.list[0], questionMap[qKey]);
        dashboard.templating.list.push(generatedVariable);
    });

    const file = `./assets/dashboard/d_${identifier}.json`;
    fs.writeFileSync(file, JSON.stringify(dashboard, null, 2));
    console.info(`+ done generating dashboard: ${file}`);
}

const main = async function () {
    if (process.argv.length < 4) {
        console.warn('-- usage parse-questions {TEMPLATEID} {FORMID}');
        return;
    }

    const dashboardTemplateId = process.argv[2];
    const formId = process.argv[3];
    await generateDashboard(dashboardTemplateId, formId);
    console.info(`done generate-dashboard`);
}

main();