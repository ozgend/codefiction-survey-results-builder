'use strict';

const fs = require('fs');
const TypeformOperations = require('./typeform-operations.js');
const _ = require('lodash');
const SURVEY_FOLDER = `./assets/survey`;

const assureSurveyFolderExists = async () => {
  if (!fs.existsSync(SURVEY_FOLDER)) {
    fs.mkdirSync(SURVEY_FOLDER);
  }
};

const getForm = async (apiKey, formId) => {
  let form;
  const file = `${SURVEY_FOLDER}/form_${formId}.json`;

  if (file && fs.existsSync(file)) {
    form = JSON.parse(fs.readFileSync(file));
    console.debug(`+ done loading form: ${file}`);
  } else {
    const typeformOperations = new TypeformOperations(apiKey);
    form = await typeformOperations.getForm({ uid: formId });
    fs.writeFileSync(file, JSON.stringify(form, null, 2));
    console.debug(`+ done fetching form: ${file}`);
  }

  return form;
};

const mapFormFields = async (apiKey, formId) => {
  const form = await getForm(apiKey, formId);

  let questions = [];
  let q = 0;

  form.fields.forEach(group => {
    if (group.properties.fields) {
      const list = group.properties.fields.map(field => {
        return {
          group_title: group.title,
          // group_id: group.id,
          // group_ref: group.ref,
          id: field.id,
          title: field.title,
          // ref: field.ref,
          // type: field.type,
          order: 'q' + `${++q}`.padStart(2, 0)
        };
      });
      questions = questions.concat(list);
    } else {
      questions.push({
        group_title: group.title,
        group_id: group.id,
        // group_ref: group.ref,
        id: group.id,
        title: group.title,
        // ref: group.ref,
        type: group.type,
        order: 'q' + `${++q}`.padStart(2, 0)
      });
    }
  });

  const file = `${SURVEY_FOLDER}/mapped_questions_${formId}.json`;
  fs.writeFileSync(file, JSON.stringify(questions, null, 2));
  console.info(`+ done mapping questions: ${file}`);

  return questions;
};

const main = async () => {
  if (process.argv.length < 4) {
    console.warn('-- usage parse-questions {APIKEY} {FORMID}');
    return;
  }
  const apiKey = process.argv[2];
  const formId = process.argv[3];
  const questions = await mapFormFields(apiKey, formId);
  console.info(`done parse-questions: ${questions.length}`);
};

assureSurveyFolderExists();

main();
