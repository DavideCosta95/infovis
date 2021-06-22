const fs = require('fs');
const express = require('express');
const app = express();

const dataset = require('./data/dataset.json');

const PORT = 5000;

/***
 * index route path
 */
fs.readFile('template/index.html', function (error, html) {
    if (error) {
        throw error;
    }
    app.get('/', function (req, res) {
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    });
});

/***
 * javascript route path
 */
fs.readFile('js/submarines.js', function (error, js) {
    if (error) {
        throw error;
    }
    app.get('/js/submarines.js', function (req, res) {
        res.writeHeader(200, {"Content-Type": "text/javascript"});
        res.write(js);
        res.end();
    });
});

/***
 * dataset route path
  */
app.get('/dataset', function (req, res) {
    res.header({"Content-Type": "application/json"});
    res.send(JSON.stringify(dataset));
});

app.listen(PORT, function () {
    console.log('App running on port ' + PORT + '\nPress CTRL+C to exit');
});