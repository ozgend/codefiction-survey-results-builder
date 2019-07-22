'use strict';

const DashboardOperations = require('./dashboard-operations');

const main = async function () {
    if (process.argv.length < 4) {
        console.warn('-- usage generate-dashboard {TEMPLATEID} {FORMID}');
        return;
    }

    const dashboardTemplateId = process.argv[2];
    const formId = process.argv[3];
    const dashboardOperations = new DashboardOperations();
 
    await dashboardOperations.generateDashboard(dashboardTemplateId, formId);

    console.info(`done generate-dashboard`);
}

main();