# codefiction survey results builder

## steps summary

```bash
## initialize storage and visualization
$ docker-compose up -d
```

[Login to grafana](http://localhost:3000) using the username and password `admin` to change the default password. Make sure you have created the `.env` file with the same folder as [the example here.](./env-sample). Then you can run the following command to start import.

```
$ npm install && start
```

---

## initialize storage and visualization

```bash
## starts elasticsearch, kibana and grafana
docker-compose up -d
```

---

## Parsing and uploading results in depth

### **1. parse questions**

gets and maps specificed survey questions

**args**

- `APIKEY`: typeform api key
- `FORMID`: typeform form id

**outputs**

- `./assets/survey/form_{FORMID}.json`: typeform api response output
- `./assets/survey/mapped_questions_{FORMID}.json`: mapped questions

### **2. parse results**

gets survey answers and maps with questions

**args**

- `APIKEY`: typeform api key
- `FORMID`: typeform form id
- `LAST_TOKEN` : (optional) _typeform api supports results after survey token. if `LAST_TOKEN` arg is provided, api response will contain the results `{ after: LAST_TOKEN }` based on `landed` field_

**outputs**

- `./assets/survey/results_{FORMID}.json`: typeform api response output
- `./assets/survey/processed_answers_{FORMID}.json`: mapped answers

### **3. seed elasticserch**

index mapped survey answers

**args**

- `ESHOST`: elasticsearch api endpoint
- `FORMID`: typeform form id

**outputs**

- `survey-{formid}`: indexed data on elasticsearch

### **4. setup grafana dashboard**

sets up and generates grafana dashboard for given template with question filters

**args**

- `TEMPLATEID`: provided template name under `./assets/dashboard/`
- `FORMID`: typeform form id
- `GRAFANA_URL`: grafana url, typically _http://localhost:3000_
- `GRAFANA_USER`: grafana admin user, typically _admin_
- `GRAFANA_PASS`: grafana admin pass, typically _admin_

**outputs**

- configured grafana elasticsearch datasource named `es-survey-{FORMID}`
- `./assets/dashboard/d_{FORMID}_{DATETIME}_{RANDOM}.json`: generated grafana dashbaord
- imported dashboard named `d_{FORMID}_{DATETIME}_{RANDOM}`

(_import generated `dashboard.json` into grafana_)
