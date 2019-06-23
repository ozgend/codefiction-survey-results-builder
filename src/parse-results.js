'use strict';

const fs = require('fs');
const TypeformOperations = require('./typeform-operations.js');
const _ = require('lodash');

const loadQuestions = async function (id) {
    const file = `./assets/survey/mapped_questions_${id}.json`;
    const questions = JSON.parse(fs.readFileSync(file));
    console.info(`+ done loading mapped questions: ${file}`);
    return questions;
}

const getResults = async function (apiKey, formId, lastToken) {
    let allItems;
    const file = `./assets/survey/results_${formId}.json`;

    if (file && fs.existsSync(file)) {
        allItems = JSON.parse(fs.readFileSync(file));
    } else {
        const typeformOperations = new TypeformOperations(apiKey);

        const fetch = async function (token) {
            const options = { uid: formId, page_size: 25 };
            if (token) {
                options.after = token;
            }
            const result = await typeformOperations.getResults(options);
            return result;
        }

        const result = await fetch(lastToken);
        allItems = [].concat(result.items);

        for (let p = 0; p < result.page_count; p++) {
            console.info(`+ fetching page ${p + 1} of ${result.page_count}`);

            const lastSurveyToken = allItems[allItems.length - 1].token;
            const fetchResult = await fetch(lastSurveyToken);
            allItems = allItems.concat(fetchResult.items);
        }

        fs.writeFileSync(file, JSON.stringify(allItems, null, 2));
    }

    console.info(`+ done fetcing answers: ${file}`)
    fs.writeFileSync(file, JSON.stringify(allItems, null, 2));

    return allItems;
}

const processResults = async function (apiKey, formId, lastToken) {
    const questions = await loadQuestions(formId);
    const questionMap = _.keyBy(questions, 'id');
    const questionKeys = Object.keys(questionMap);
    const allItems = await getResults(apiKey, formId, lastToken);

    console.info(`+ done loading results: ${allItems.length}`);

    let responseDocuments = [];
    let r = 0;

    allItems.forEach(item => {

        console.info(`+ processing answers: ${++r} of ${allItems.length}`);

        const responseDocument = {
            incomplete: false,
            landed: item.landed_at,
            submitted: item.submitted_at,
            token: item.token,
            metadata: item.metadata,
            responses: {}
        };

        if (item.answers) {

            item.answers.forEach(answer => {

                let response = {
                    type: answer.type,
                    hasMultiple: false,
                    hasOther: false,
                    question: questionMap[answer.field.id],
                    answer: [],
                    answerText: ''
                };

                if (answer.type === 'email') {
                    response.answer.push(answer[answer.type].trim());
                } else {
                    if (answer[answer.type].labels) {
                        response.hasMultiple = true;
                        response.answer = answer[answer.type].labels;
                    } else if (answer[answer.type].label) {
                        response.answer.push(answer[answer.type].label.trim());
                    }

                    if (answer[answer.type].other) {
                        response.answer.push(answer[answer.type].other.trim());
                        response.hasOther = true;
                    }
                }

                response.answerText = response.answer.join('; ').trim();

                const questionKey = questionMap[answer.field.id].order;
                responseDocument.responses[questionKey] = response;
            });

            const questionsAnswered = item.answers.map(answer => answer.field.id);
            const questionsMissing = _.difference(questionKeys, questionsAnswered);

            questionsMissing.forEach(qKey => {
                responseDocument.responses[questionMap[qKey].order] = {
                    missing: true,
                    question: questionMap[qKey],
                    answer: ["EMPTY"],
                    answerText: 'EMPTY'
                };
            });

        } else {
            responseDocument.incomplete = true;
        }

        responseDocuments.push(responseDocument);

    });

    const file = `./assets/survey/processed_answers_${formId}.json`;
    fs.writeFileSync(file, JSON.stringify(responseDocuments, null, 2));
    console.info(`+ done processing answers: ${file}`);

    return responseDocuments;
}

const main = async function () {
    if (process.argv.length < 4) {
        console.warn('-- usage parse-results {APIKEY} {FORMID} [LAST_TOKEN]');
        return;
    }
    const apiKey = process.argv[2];
    const formId = process.argv[3];
    const lastToken = process.argv[4];
    const responses = await processResults(apiKey, formId, lastToken);
    console.info(`done parse-results: ${responses.length}`);
}

main();