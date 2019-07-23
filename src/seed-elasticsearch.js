'use strict';

const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

const loadAnswers = async function(id) {
  const file = `./assets/survey/processed_answers_${id}.json`;
  const answers = JSON.parse(fs.readFileSync(file));
  console.info(`+ done loading answers: ${file}`);
  return answers;
};

const save = async function(client, index, type, answers) {
  let failed = [];

  for (let a = 0; a < answers.length; a++) {
    try {
      await client.index({ index, type, body: answers[a] });
      console.info(`+ sent to es: ${a} of ${answers.length}`);
    } catch (error) {
      failed.push(answers[a]);
      console.error(`+ error: ${error.message} ${error.detail}`);
    }
  }

  const result = {
    failed,
    failedCount: failed.length,
    doneCount: answers.length - failed.length,
    retry: failed.length != 0
  };

  return result;
};

const uploadToElasticsearch = async function(esHost, id) {
  const index = `survey-${id}`.toLowerCase();
  const type = `answer-${id}`.toLowerCase();
  const answers = await loadAnswers(id);
  const client = new Client({ node: esHost });

  const indexExistResponse = await client.indices.exists({ index });

  if (indexExistResponse.statusCode === 200) {
    await client.indices.delete(index);
  } else {
    try {
      const indexParameters = {
        index,
        body: {
          settings: {
            index: {
              mapping: {
                total_fields: {
                  limit: 4000
                }
              }
            }
          }
        }
      };

      await client.indices.create(indexParameters);
    } catch (error) {
      console.error(' ---- index create error:', error);
      throw error;
    }
  }

  let result = await save(client, index, type, answers);

  while (result.retry) {
    console.warn(' ---- retrying failed records...');
    result = await save(client, index, type, result.failed);
  }

  console.info(`+ done uploading to es: ${answers.length}`);
};

module.exports.seedElkProcessor = async function({ esHost, formId }) {
  await uploadToElasticsearch(esHost, formId);
};
