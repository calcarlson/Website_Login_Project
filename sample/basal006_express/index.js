var express = require("express");
var app = express();
var bodyparser = require('body-parser');
var fs = require("fs");
var xml2js = require("xml2js");
var session = require('express-session');
var crypto = require('crypto');
var mysql = require("mysql");

var thisUser;
var currentId;
var parser = new xml2js.Parser();
var theinfo;
var host;
var db;
var pass;
var por;
var use;

var con;

fs.readFile(__dirname + '/sample_dbconfig.xml', function(err, data) {
    if (err) throw err;
    parser.parseString(data, function(err, result) {
        if (err) throw err;

        theinfo = result;
    });
    host = theinfo.dbconfig.host[0];
    db = theinfo.dbconfig.database[0];
    pass = theinfo.dbconfig.password[0];
    use = theinfo.dbconfig.user[0];
    por = theinfo.dbconfig.port[0];

});
var con = mysql.createConnection({
    host: "cse-larry.cse.umn.edu",
    user: "C4131S20U18", // replace with the database user provided to you
    password: "354", // replace with the database password provided to you
    database: "C4131S20U18", // replace with the database user provided to you
    port: 3306
});


con.connect(function(err) {
    if (err) {
        throw err;
    };
    console.log("Connected!");
});

app.use(bodyparser());

app.use(session({
    secret: "csci4131secretkey",
    saveUninitialized: true,
    resave: false
}));
app.listen(9362, () => console.log('Listening on port 9362!'));

app.get('/', function(req, res) {
    req.session.value = 0;
    res.sendFile(__dirname + '/client/welcome.html');
});

app.get('/admin', function(req, res) {
    if (req.session.value) {
        res.sendFile(__dirname + '/client/admin.html');
    } else {
        res.redirect('/welcome');
        console.log("you must log in first");
    }
});

app.get('/welcome', function(req, res) {
    req.session.value = 0;
    res.sendFile(__dirname + '/client/welcome.html');
});

app.get('/table', function(req, res) {
    res.sendFile(__dirname + '/contact.json');
});

app.get('/contact', function(req, res) {
    if (req.session.value) {
        res.sendFile(__dirname + '/client/contact.html');
    } else {
        res.redirect('/welcome');
        console.log("you must log in first");
    }


});

app.get('/addContact', function(req, res) {
    console.log(req.session.value);
    if (req.session.value) {
        res.sendFile(__dirname + '/client/addContact.html');
    } else {
        res.redirect('/welcome');
        console.log("you must log in first");
    }
});

app.get('/stock', function(req, res) {
    if (req.session.value) {
        res.sendFile(__dirname + '/client/stock.html');
    } else {
        res.redirect('/welcome');
        console.log("you must log in first");
    }
});

app.get('/login', function(req, res) {

    res.sendFile(__dirname + '/client/login2.html');
});


app.get('/userLogin', function(req, res) {

    console.log("userLogin: ", thisUser);
    res.send(thisUser);
});

app.get('/getUsers', function(req, res) {

    con.query('select * from `tbl_accounts`', function(err, results, fields) {
        if (err) throw err;


        console.log("Index", results);
        res.send(results);
    });
});

app.post('/postContact', function(req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var address = req.body.address;
    var phone = req.body.phoneNumber;
    var place = req.body.favoritePlace;
    var url = req.body.favoritePlaceURL;

    var sql = "INSERT INTO `tbl_contacts` (`contact_name`, `contact_email`,`contact_address`,`contact_phone`,`contact_favoriteplace`,`contact_favoriteplaceurl`) VALUES ('" + name + "', '" + email + "','" + address + "','" + phone + "','" + place + "','" + url + "')";
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("1 record inserted, ID: " + result.insertId);
    });



    con.query('select * from `tbl_contacts`', function(err, results, fields) {
        if (err) throw err;

        fs.writeFile('contact.json', JSON.stringify(results), function(err) {
            if (err) throw err;
            console.log('Saved!');
        });

    });

    res.redirect('/contact');
});


app.post('/addUser', function(req, res) {
    var name = req.body.name;
    var login = req.body.login;
    var password = req.body.password;

    con.query('select * from `tbl_accounts` WHERE `acc_login` = ' + mysql.escape(login), function(err, results, fields) {
        if (err) throw err;
        if (results.length > 0) {

            res.redirect('back');
            console.log("theres already a user with that login!: ")
        } else {

            var sql = "INSERT INTO `tbl_accounts` (`acc_name`,`acc_login`,`acc_password`) VALUES ('" + name + "', '" + login + "','" + password + "')";
            con.query(sql, function(err, result) {
                if (err) throw err;
                console.log("1 record inserted, ID: " + result.insertId);
            });
        }
    });

});

app.post('/updateUser', function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var login = req.body.login;
    var password = req.body.password;
    if (id != currentId) {
        con.query('UPDATE `tbl_accounts` SET `acc_name` = ' + mysql.escape(name) + ', `acc_login` =' + mysql.escape(login) + ', `acc_password` = ' + mysql.escape(password) + 'WHERE `acc_id`= ' + mysql.escape(id), function(err, results, fields) {
            if (err) throw err;
        });
    } else {
        console.log("cannot update current user!");
        res.redirect('back');
    }

});

app.post('/deleteUser', function(req, res) {
    var name = req.body.name;
    var id = req.body.id;
    var login = req.body.login;
    var password = req.body.password;
    console.log("currentId: ", currentId);
    console.log("id: ", id);
    console.log("name: ", login);
    if (login != thisUser) {
        con.query('DELETE FROM `tbl_accounts` WHERE `acc_login` = ' + mysql.escape(login), function(err, results, fields) {
            if (err) throw err;
        });
    } else {
        console.log("cannot delete current user!");
        res.redirect('back');
    }
});

app.post('/sendLoginDetails', function(req, res) {
    passwordValidate(req, res);
});

app.get('/logout', function(req, res) {
    req.session.value = 0;
    res.redirect('/welcome');
    console.log("you have been logged out");
});

app.use('/client', express.static(__dirname + '/client'));

app.get('*', function(req, res) {
    res.send("404 page not found");
});

function passwordValidate(req, res) {

    var username = req.body.name;
    thisUser = username;
    var password = req.body.password;
    console.log("username:");
    console.log(username);
    console.log("password:");
    console.log(password);


    con.query('SELECT * FROM tbl_accounts WHERE acc_login = ? AND acc_password = ?', [username, password], function(error, results, fields) {
        console.log(username);
        if (results.length > 0) {
            console.log("login: ", results[0].acc_id);
            currentId = results[0].acc_id;
            req.session.value = 1;
            res.redirect('/contact');
        } else {
            res.send('Incorrect Username and/or Password!');
        }
        res.end();
    });

};