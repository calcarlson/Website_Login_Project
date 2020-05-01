// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT
var parser  = require('xml2js').Parser();

// include the express module
var express = require("express");

// create an express application
var app = express();

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-256 algorithm
var crypto = require('crypto');

// include the mysql module
var mysql = require("mysql");
var loginRight = false;
// apply the body-parser middleware to all incoming requests
app.use(bodyparser());
app.use( bodyparser.json() );       // to support JSON-encoded bodies
app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false}
));

var con;
fs.readFile(__dirname + '/dbconfig.xml', function(err, data){
  if (err) throw err;
  parser.parseString(data, function(err, result) {
    if (err) throw err;
    json = result
    con = mysql.createConnection({
	  host: json.dbconfig.host[0],
	  user: json.dbconfig.user[0], // replace with the database user provided to you
	  password: json.dbconfig.password[0], // replace with the database password provided to you
	  database: json.dbconfig.database[0], // replace with the database user provided to you
	  port: json.dbconfig.port[0]
	});
  });
});
// server listens on port 9007 for incoming connections
app.listen(9096, () => console.log('Listening on port 9007!'));

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/welcome.html');
});

// // GET method route for the contact page.
// It serves contact.html present in client folder
app.get('/contact',function(req, res) {
  if (!req.session.value) {
    res.redirect('/login');
  } else {
    res.sendFile(__dirname + '/client/contact.html');
  }
});

// GET method route for the addContact page.
// It serves addContact.html present in client folder
app.get('/addContact',function(req, res) {
  if (!req.session.value) {
    res.redirect('/login');
  } else {
    res.sendFile(__dirname + '/client/addContact.html');
  }
});
//GET method for stock page
app.get('/stock', function (req, res) {
  if (!req.session.value) {
    res.redirect('/login');
  } else {
    res.sendFile(__dirname + '/client/stock.html');
  }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login',function(req, res) {
  if (req.session.value) {
    res.redirect('/contact');
  } else {
    res.sendFile(__dirname + '/client/login.html');
  }
});
app.get('/admin', function (req, res) {
  if (!req.session.value) {
    res.redirect('/login');
  } else {
    res.sendFile(__dirname + '/client/adminPage.html');
  }
});

app.get('/updateUsers', function(req, res) { 
  con.connect(function(err) {
    var user = req.body.Username;
    var pass = crypto.createHash('sha256').update(req.body.Password).digest('base64');
    var name = req.body.Name;
    var varID = req.body.ID;
    var sql = 'UPDATE SET acc_name = ?, acc_login= ?, acc_password = ?';
    con.query(sql, [name, user, pass],  function(err, result) {
      if(err) {
        throw err;
      }
      console.log("Deleted");
      res.redirect('/admin');
    });
  });
});
app.get('/deleteUsers', function(req, res) { 
  if (req.body.ID == req.session.user_id){
    res.write("Wrong");
    res.end();
  } else {
    var id = req.body.ID
    con.connect(function(err) {
      var sql = `DELETE FROM tbl_accounts WHERE acc_id = ?`;
      con.query(sql, [id],  function(err, result) {
        if(err) {
          throw err;
        }
        console.log("Deleted");
        res.write("Right");
        res.end();
      });
    });
  }
});

app.post('/postUser', function(req, res) {
  con.connect(function(err) {
    if (err) {
      throw err;
    };
    console.log("Connected!");
  
    var rowToBeInserted = {
      acc_name: req.body.Name, // replace with acc_name chosen by you OR retain the same value
      acc_login: req.body.Username, // replace with acc_login chosen by you OR retain the same vallue
      acc_password: crypto.createHash('sha256').update(req.body.Password).digest('base64') // replace with acc_password chosen by you OR retain the same value
    };
  
    con.query('INSERT tbl_accounts SET ?', rowToBeInserted, function(err, result) {
      if(err) {
        throw err;
      }     
      res.redirect('/admin');    
    });
  });
});

app.get('/getListOfUsers', function(req, res) { 
  con.connect(function(err) {
    if (err) {
      throw err;
    }; 
    con.query("SELECT * FROM tbl_accounts", function (err, result, fields) {
    if (err){
      throw err;
    }
    var accounts = {
      account: []
    };
    for(var i in result) {    
      var person = result[i];   
      accounts.account.push({ 
          "ID" : person.acc_id,
          "Name"  : person.acc_name,
          "Login"       : person.acc_login,
          "NewPassword"       : person.acc_password
      });
    }
      res.set('Content-Type', 'text/plain');
      res.status(200).json(accounts);
    })
  });
});
// GET method to return the list of contacts
// The function queries the tbl_contacts table for the list of contacts and sends the response back to client
app.get('/getListOfContacts', function(req, res) {
  con.connect(function(err) {
    if (err) {
      throw err;
    }; 
    con.query("SELECT * FROM tbl_contacts", function (err, result, fields) {
    if (err){
      throw err;
    }
    var contacts = {
      contact: []
    };
    for(var i in result) {    
      var person = result[i];   
      contacts.contact.push({ 
          "name" : person.contact_name,
          "email"  : person.contact_email,
          "address"       : person.contact_address,
          "phoneNumber"       : person.contact_phone,
          "favoritePlace"       : person.contact_favoriteplace,
          "favoritePlaceURL"       : person.contact_favoriteplaceurl
      });
    }
      res.set('Content-Type', 'text/plain');
      res.status(200).json(contacts);
    })
  });
});
// POST method to insert details of a new contact to tbl_contacts table
app.post('/postContact', function(req, res) {
  con.connect(function(err) {
    if (err) {
      throw err;
    }; 
      var bod = req.body;
      var name = bod.contactName;
      var email = bod.email;
      var address = bod.address;
      var phone = bod.phoneNumber;
      var favoriteplace = bod.favoritePlace;
      var favoriteplaceURL = bod.favoritePlaceURL;
      var first = "INSERT INTO tbl_contacts (contact_name, contact_email, contact_address, contact_phone, contact_favoriteplace, contact_favoriteplaceurl) VALUES ";
      var second =  "('" + name + "','" + email + "','" + address+ "','" +phone+ "','" +favoriteplace+ "','" +favoriteplaceURL + "')";
      var sql = first + second;

      con.query(sql, function (err, result) {
        if (err){
          throw err;
        }
        console.log("1 record inserted");
        res.redirect('/contact');
      });
  });
});


// POST method to validate user login
// upon successful login, user session is created
app.post('/sendLoginDetails', function(req, res) { 
  var bod = req.body;
  console.log(json);
  con.connect(function(err) {
    if (err) {
      throw err;
    }; 
    con.query("SELECT * FROM tbl_accounts", function (err, result, fields) {
      if (err){
        throw err;
      }
      var x = 0;
      var found = false;
      var username = req.body.Username;
      var sess = req.session;
      var password = crypto.createHash('sha256').update(req.body.Password).digest('base64');
      for(x = 0; x < result.length; x++) {
          resu = result[x];
          if ((resu.acc_login==username) && (resu.acc_password==password)) {
            sess.value = 1;
			sess.save();
			res.write(JSON.stringify({Stuff:true}));
			res.end();
			found = true;
          }
      }
	  if (!found) {
      	res.write(JSON.stringify({Stuff:false}));
		res.end();
	  }
    })
  });
});

// log out of the application
// destroy user session
app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
});

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  res.sendStatus(404);
});
