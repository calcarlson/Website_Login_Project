var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var parser = require("xml2js").Parser();
var fs = require("fs");
var session = require('express-session');
var crypto = require('crypto');
var path = require('path');
var mysql = require("mysql");
var xml2js = require('xml2js');
var loginCheck = false;
app.use(bodyparser.json());

app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "csci4131secretkey",
    saveUninitialized: true,
    resave: false
}));
app.use(express.static('carl5362_hw07'));

app.listen(9362, () => console.log('Listening on port 9362!'));

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/dbconfig.xml', function(err, data) {
    parser.parseString(data, function(err, result) {
        con = mysql.createConnection({
            host: result.dbconfig.host[0],
            user: result.dbconfig.user[0],
            password: result.dbconfig.password[0],
            database: result.dbconfig.database[0],
            port: result.dbconfig.port[0]
        });
    });
});

app.get('/Admin', function(req, res) {
    if (!loginCheck) {
        res.redirect('/login');
    } else {
        res.sendFile(__dirname + '/client/adminpage.html');
    }
});

app.get('/', function(req, res) {
    if (!loginCheck) {
        res.redirect('/client/welcome.html');
    } else { res.sendFile(__dirname + '/client/welcome.html'); }
});
app.get('/contact', function(req, res) {
    if (!loginCheck) {
        res.redirect('/login');
    } else { res.sendFile(__dirname + '/client/contact.html'); }
});
app.get('/addContact', function(req, res) {
    if (!loginCheck) {
        res.redirect('/login');
    } else { res.sendFile(__dirname + '/client/addContact.html'); }
});
app.get('/stock', function(req, res) {
    if (!loginCheck) {
        res.redirect('/login');
    } else { res.sendFile(__dirname + '/client/stock.html'); }
});
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/client/login.html');
});
app.get('/logout', function(req, res) {
    loginCheck = false;
    req.session.destroy();
    loginCheck = false, res.redirect('/login');
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

app.post('/validateNewUser', function(req, res) {
    var name = req.body.name;
    var login = req.body.login;
    var password = crypto.createHash('sha256').update(password).digest('base64');

    console.log(`Adding new user ${login}`);

    var sql = `SELECT acc_password FROM tbl_accounts WHERE acc_login = '${login}'`;
    con.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            console.log(`Error: Found user ${result[0].acc_login} in database`);
            res.status(500).send('Found user undefined in database');
        } else {
            console.log(`User ${login} not found. Adding to database.`);
            con.query('INSERT tbl_accounts SET ?', { acc_name: name, acc_login: login, acc_password: password }, function(err, result) {
                if (err) {
                    throw err;
                }
                console.log("Value inserted");
                res.status(200).send('ok');
            });
        }
    });
});

app.post('/updateUser', function(req, res) {
    var name = req.body.name;
    var login = req.body.login;
    var oldLogin = req.body.oldLogin;
    var password = crypto.createHash('sha256').update(password).digest('base64');

    console.log(`Updating user ${login}`);
    con.query(`SELECT * FROM tbl_accounts WHERE acc_login = '${login}' and acc_login != '${oldLogin}'`, function(err, result) {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            console.log(`Error: Found user ${result[0].acc_login} in database`);
            res.status(500).send('Found user undefined in database');
        } else {
            console.log(`User ${login} not found. Adding to database.`);
            var sql = `UPDATE tbl_accounts SET ? WHERE acc_login = '${oldLogin}'`;
            var row = { acc_name: name, acc_login: login, acc_password: password };
            con.query(sql, row, function(err, result) {
                if (err) {
                    throw err;
                }
                console.log("Value updated");
                req.session.username = acc_login;
                res.status(200).send('ok');
            });
        }
    });
});

app.post("/sendLoginDetails", function(req, res) {
    var con = mysql.createConnection({
        host: 'cse-larry.cse.umn.edu',
        user: 'C4131S20U18', // replace with the database user provided to you
        password: '354', // replace with the database password provided to you
        database: 'C4131S20U18', // replace with the database user provided to you
        port: '3306'
    });
    var username = req.body.username;
    var password = crypto.createHash('sha256').update(password).digest('base64');

    con.query("SELECT * FROM tbl_accounts", function(err, results, fields) {
        if (err) throw err;

        for (result of results) {
            var hashedInput = crypto.createHash('sha256').update(password).digest('base64');
            var passCheck = hashedInput == result.acc_password;
            var userCheck = username == result.acc_login;

            if (passCheck && userCheck) {
                console.log("Succesful Login");
                loginCheck = true;
                currentUser = result.acc_name;
                currentLogin = result.acc_login;
                console.log("redirecting to contact page");
                res.sendFile(__dirname + '/client/Contact.html');
                console.log("redirect successful")
            } else {
                console.log("Username or Password is incorrect");
                res.status(500).send('Error: Invalid credentials');
            }
        }
    });
});



app.delete('/deleteUser', function(req, res) {
    var login = req.body.acc_login;
    console.log(`User ${req.session.username} is deleting user ${acc_login}`);

    if (login === req.session.username) {
        res.status(500).send('Error: Can not delete the user that is logged in');
    } else {
        var sql = `DELETE FROM tbl_accounts WHERE acc_login = '${acc_login}'`;
        console.log(sql);
        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log(`Deleted user ${acc_login}`);
            res.send('ok');
        });
    }
});

app.get('/currentUser', function(req, res) {
    if (req.session.username) {
        res.send(req.session.username);
    }
})

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
});

app.use('/client', express.static(__dirname + '/client'));

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/client/404.html');
});