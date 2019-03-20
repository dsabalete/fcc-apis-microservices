'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');

const cors = require('cors');
const bodyParser = require('body-parser');
const nanoid = require('nanoid');

const dns = require('dns');

const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/
const connectOptions = {
    useNewUrlParser: true,
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE
};
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, connectOptions, (err, db) => {
    if (err) console.log(`Error`, err);
    app.locals.db = db;
    console.log(`Connected to MongoDB`);
});

app.use(cors());

const shortenURL = (db, url) => {
    const shortenedURLs = db.collection('shortenedURLs');
    return shortenedURLs.findOneAndUpdate({ original_url: url },
        {
            $setOnInsert: {
                original_url: url,
                short_id: nanoid(7),
            },
        },
        {
            returnOriginal: false,
            upsert: true,
        }
    );
};


const checkIfShortIdExists = (db, code) => db.collection('shortenedURLs').findOne({ short_id: code });


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
});


app.post("/api/shorturl/new", (req, res) => {
    let originalUrl;
    try {
        originalUrl = new URL(req.body.url);
    } catch (err) {
        res.json({ error: 'invalid URL' });
    }

    // validate url
    dns.lookup(originalUrl.hostname, (err) => {
        if (err) {
            res.json({ error: 'Address not found' });
        };

        const { db } = req.app.locals;
        shortenURL(db, originalUrl.href)
            .then(result => {
                const doc = result.value;
                res.json({
                    original_url: doc.original_url,
                    short_id: doc.short_id,
                });
            })
            .catch(console.error);
    });


    app.get('/api/shorturl/:short_id', (req, res) => {
        const shortId = req.params.short_id;
        const { db } = req.app.locals;
        checkIfShortIdExists(db, shortId)
            .then(doc => {
                if (doc === null) return res.send('There is no link at that URL');

                res.redirect(doc.original_url);
            });
    });

    // res.json({ 'original_url': originalUrl, 'short_url': short_url });
});


app.listen(port, () => {
    console.log('Node.js listening ...');
});
