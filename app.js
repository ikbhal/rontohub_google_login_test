
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3029;

// Setup SQLite3 database
// const db = new sqlite3.Database(':memory:');
const db = new sqlite3.Database('counters.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the counters database');
        db.run('CREATE TABLE IF NOT EXISTS counter (value INTEGER)');
    }
});

// Set up sessions
app.use(session({
    secret: 'muhammed',
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google Strategy
passport.use(new GoogleStrategy({
    // clientID: 'your-client-id',
    clientID: '275781557350-6nntan81eco5k57i3g2cq7a5m6n40nme.apps.googleusercontent.com',
    // clientSecret: 'your-client-secret',
    clientSecret: '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',
    // callbackURL: 'http://localhost:3000/auth/google/callback'
    // callbackURL: 'https://counter.rontohub.com/auth/google/callback'
    callbackURL: 'https://rontohub.com/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Here you would save the user to the database or perform other actions
    return done(null, profile);
}));

// Serialize and Deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the counter app');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/counter');
    }
);

app.get('/counter', (req, res) => {
    db.serialize(() => {
        // db.run('CREATE TABLE IF NOT EXISTS counter (value INTEGER)');
        db.get('SELECT value FROM counter', (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            const counterValue = row ? row.value : 0;
            res.send(`Counter Value: ${counterValue}`);
        });
    });
});

app.post('/counter/increase', (req, res) => {
    db.serialize(() => {
        // db.run('CREATE TABLE IF NOT EXISTS counter (value INTEGER)');
        db.get('SELECT value FROM counter', (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            const newValue = (row ? row.value : 0) + 1;
            db.run('INSERT OR REPLACE INTO counter (value) VALUES (?)', newValue, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect('/counter');
            });
        });
    });
});

app.post('/counter/decrease', (req, res) => {
    db.serialize(() => {
        // db.run('CREATE TABLE IF NOT EXISTS counter (value INTEGER)');
        db.get('SELECT value FROM counter', (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            const newValue = (row ? row.value : 0) - 1;
            db.run('INSERT OR REPLACE INTO counter (value) VALUES (?)', newValue, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect('/counter');
            });
        });
    });
});

app.post('/counter/reset', (req, res) => {
    const resetValue = 0;
    db.run('INSERT OR REPLACE INTO counter (value) VALUES (?)', resetValue, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/counter');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
