# codefiction survey results builder

## storage and visualization 

### **elasticsearch**
```bash
docker run \
    -d \
    -p 5601:5601 \
    -p 9200:9200 \
    -p 5044:5044 \
    -e LOGSTASH_START=0 \
    --name elk \
    sebp/elk
```

### **grafana**
```bash
docker run \
    -d \
    -p 3000:3000 \
    -e "GF_INSTALL_PLUGINS=grafana-piechart-panel" \
    -v grafana-storage:/var/lib/grafana \
    --name=grafana \
    grafana/grafana
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



### **4. generate dashboard**
generates grafana dashboard for given template with question filters
```bash
npm run gen:d {TEMPLATEID} {FORMID}
```
**args**
- `TEMPLATEID`: provided template name under `./assets/dashboard/`
- `FORMID`: typeform form id

**outputs**
- `./assets/dashboard/d_{TEMPLATEID}_{FORMID}_{DATETIME}_{RANDOM}.json`:  generated grafana dashbaord 

(*import generated `dashboard.json` into grafana*)