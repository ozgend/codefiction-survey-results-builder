'use strict';

const fs = require('fs');
const { Client } = require('@elastic/elasticsearch')

const loadAnswers = async function(id) {
    const file = `./assets/survey/processed_answers_${id}.json`;
    const answers = JSON.parse(fs.readFileSync(file));
    console.info(`+ done loading answers: ${file}`);
    return answers;
}

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
}

const uploadToElasticsearch = async function(esHost, id) {
    const index = `survey-${id}`.toLowerCase();
    const type = `answer-${id}`.toLowerCase();
    const answers = await loadAnswers(id);
    const client = new Client({ node: esHost });

    try {
        const ires = await client.indices.create({ index });
    } catch (error) {

    }

    let result = await save(client, index, type, answers);

    while (result.retry) {
        console.warn(' ---- retrying failed records...');
        result = await save(client, index, type, result.failed);
    }

    console.info(`+ done uploading to es: ${answers.length}`);
}

const main = async function() {
    if (process.argv.length < 4) {
        console.warn('-- usage seed-elasticsearch {ESHOST} {FORMID}');
        return;
    }
    const esHost = process.argv[2];
    const formId = process.argv[3];
    await uploadToElasticsearch(esHost, formId);
}

main();