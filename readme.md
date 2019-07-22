# codefiction survey results builder

## steps summary

```bash
## initialize storage and visualization 
$ docker-compose up -d

## parse form and questions
$ npm run parse:q {APIKEY} {FORMID}

## parse answers and results
$ npm run parse:r {APIKEY} {FORMID}

## seed elasticsearch
$ npm run seed:es {ESHOST} {FORMID}

## setup grafana
$ npm run setup:grafana {TEMPLATEID} {FORMID} {GRAFANA_URL} {GRAFANA_USER} {GRAFANA_PASS}
```

---


## initialize storage and visualization 

```bash
## starts elasticsearch, kibana and grafana
docker-compose up -d
```

---

## parsing and uploading results

### **1. parse questions**
gets and maps specificed survey questions
```bash
npm run parse:q {APIKEY} {FORMID}
```
**args**
- `APIKEY`: typeform api key
- `FORMID`: typeform form id

**outputs**
- `./assets/survey/form_{FORMID}.json`: typeform api response output
- `./assets/survey/mapped_questions_{FORMID}.json`: mapped questions 


### **2. parse results**
gets survey answers and maps with questions
```bash
npm run parse:r {APIKEY} {FORMID} [LAST_TOKEN]
```
**args**
- `APIKEY`: typeform api key
- `FORMID`: typeform form id
- `LAST_TOKEN` : (optional) *typeform api supports results after survey token. if `LAST_TOKEN` arg is provided, api response will contain the results `{ after: LAST_TOKEN } ` based on `landed` field*

**outputs**
- `./assets/survey/results_{FORMID}.json`: typeform api response output 
- `./assets/survey/processed_answers_{FORMID}.json`: mapped answers


### **3. seed elasticserch**
index mapped survey answers
```bash
npm run seed:es {ESHOST} {FORMID}
```
**args**
- `ESHOST`: elasticsearch api endpoint
- `FORMID`: typeform form id

**outputs**
- `survey-{formid}`: indexed data on elasticsearch



### **4. setup grafana dashboard**
sets up and generates grafana dashboard for given template with question filters
```bash
npm run setup:grafana {TEMPLATEID} {FORMID} {GRAFANA_URL} {GRAFANA_USER} {GRAFANA_PASS}
```
**args**
- `TEMPLATEID`: provided template name under `./assets/dashboard/`
- `FORMID`: typeform form id
- `GRAFANA_URL`: grafana url, typically *http://localhost:3000*
- `GRAFANA_USER`: grafana admin user, typically *admin*
- `GRAFANA_PASS`: grafana admin pass, typically *admin*


**outputs**
- configured grafana elasticsearch datasource named `es-survey-{FORMID}`
- `./assets/dashboard/d_{FORMID}_{DATETIME}_{RANDOM}.json`:  generated grafana dashbaord 
- imported dashboard named `d_{FORMID}_{DATETIME}_{RANDOM}`

(*import generated `dashboard.json` into grafana*)

