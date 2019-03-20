// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", (req, res) => {
    res.json({ greeting: 'hello API' });
});

app.get("/api/timestamp/:date_string?", (req, res) => {
    const param = req.params.date_string;

    try {
        let dateCreated = param === undefined ?
            new Date() : isNaN(param) ?
                new Date(param) : new Date(parseInt(param));

        res.json({ "unix": dateCreated.getTime(), "utc": dateCreated.toUTCString() });
    } catch (err) {
        res.json({ "unix": null, "utc": "Invalid Date" });
    }
});
// /api/timestamp/:date_string?


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
