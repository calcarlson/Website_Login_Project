var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var fs = require("fs");
var session = require('express-session');
var crypto = require('crypto');
var mysql = require("mysql");
var con;
app.use(bodyparser());
app.use(session({ secret: "csci4131secretkey", saveUninitialized: true, resave: false }));
app.listen(9362, () => console.log('Listening on port 9362!'));
//METHODS FOR GET REQUESTS
app.get('/', function(req, res) {
    if (!req.session.authenticated) {
        res.redirect('/client/welcome.html');
    } else { res.sendFile(__dirname + '/client/welcome.html'); }
});
app.get('/contact', function(req, res) {
    if (!req.session.authenticated) {
        res.redirect('/login');
    } else { res.sendFile(__dirname + '/client/contact.html'); }
});
app.get('/addContact', function(req, res) {
    if (!req.session.authenticated) {
        res.redirect('/login');
    } else { res.sendFile(__dirname + '/client/addContact.html'); }
});
app.get('/stock', function(req, res) {
    if (!req.session.authenticated) {
        res.redirect('/login');
    } else { res.sendFile(__dirname + '/client/stock.html'); }
});
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/client/login.html');
});
app.get('/logout', function(req, res) {
    req.session.destroy();
    req.session.authenticated = false, res.redirect('/login');
});
app.get('/getContacts', function(req, res) {
    var sql = 'SELECT * FROM tbl_contacts';

    con.query(sql, function(err, result) {
        if (err) { throw err };
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.write(JSON.stringify(result, null, 2));
        res.end();
    });
});
//METHODS FOR POST REQUESTS
app.post('/postContact', function(req, res) {
    var Values = {
        contact_name: req.body.contactname,
        contact_email: req.body.email,
        contact_address: req.body.address,
        contact_phone: req.body.phonenumber,
        contact_favoriteplace: req.body.favoriteplace,
        contact_favoriteplaceurl: req.body.favoriteplaceurl,
    };
    con.query('INSERT tbl_contacts SET ?', Values, function(err, result) {
        if (err) { throw err; }
        console.log("Contact Entry Added"), res.statusCode = 302, res.setHeader('Location', '/contact'), res.end();
    });
});
app.post('/sendLoginDetails', function(req, res) {
    var mysql = require("mysql");
    var username = req.body.username;
    var password = req.body.password;
    con = mysql.createConnection({
        host: "cse-larry.cse.umn.edu",
        user: "C4131S20U1",
        password: "354",
        database: "C4131S20U1",
        port: 3306
    });
    con.connect(function(err) {
        if (err) {
            throw err;
        };
        console.log("Connected!");
        var sql = `SELECT acc_password FROM tbl_accounts WHERE acc_login = '${username}'`;
        con.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            if (password == result[0].acc_password) {
                req.session.success = true;
                res.redirect('/contact');
            } else {
                res.sendFile(__dirname + '/login.html');
            }

        });
    });
});
app.use('/client', express.static(__dirname + '/client'));
app.get('*', function(req, res) { res.sendFile(__dirname + '/client/404.html'); });