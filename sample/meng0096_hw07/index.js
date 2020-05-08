// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT
var parser = require("xml2js").Parser();

// include the express module
var express = require("express");

// create an express application
var app = express();
var user = "";
// helps in extracting the body portion of an incoming request stream
var bodyparser = require("body-parser");

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require("express-session");

// native js function for hashing messages with the SHA-256 algorithm
var crypto = require("crypto");

// include the mysql module
var mysql = require("mysql");
var loginRight = false;
// apply the body-parser middleware to all incoming requests
app.use(bodyparser());
app.use(bodyparser.json()); // to support JSON-encoded bodies
app.use(
  bodyparser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

// use express-session
// in mremory session is sufficient for this assignment
app.use(
  session({
    secret: "csci4131secretkey",
    saveUninitialized: true,
    resave: false
  })
);
var json;
fs.readFile(__dirname + "/dbconfig.xml", function(err, data) {
  if (err) throw err;
  parser.parseString(data, function(err, result) {
    if (err) throw err;
    json = result;
  });
});
// server listens on port 9007 for incoming connections
app.listen(9096, () => console.log("Listening on port 9007!"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/welcome.html");
});

// // GET method route for the contact page.
// It serves contact.html present in client folder
app.get("/contact", function(req, res) {
  if (!req.session.value) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + "/client/contact.html");
  }
});

// GET method route for the addContact page.
// It serves addContact.html present in client folder
app.get("/addContact", function(req, res) {
  if (!req.session.value) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + "/client/addContact.html");
  }
});
//GET method for stock page
app.get("/stock", function(req, res) {
  if (!req.session.value) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + "/client/stock.html");
  }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get("/login", function(req, res) {
  if (req.session.value) {
    res.redirect("/contact");
  } else {
    res.sendFile(__dirname + "/client/login.html");
  }
});

// GET method to return the list of contacts
// The function queries the tbl_contacts table for the list of contacts and sends the response back to client
app.get("/getListOfContacts", function(req, res) {
  var con = mysql.createConnection({
    host: json.dbconfig.host[0],
    user: json.dbconfig.user[0], // replace with the database user provided to you
    password: json.dbconfig.password[0], // replace with the database password provided to you
    database: json.dbconfig.database[0], // replace with the database user provided to you
    port: json.dbconfig.port[0]
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    }
    con.query("SELECT * FROM tbl_contacts", function(err, result, fields) {
      if (err) {
        throw err;
      }
      var contacts = {
        contact: []
      };
      for (var i in result) {
        var person = result[i];
        contacts.contact.push({
          name: person.contact_name,
          email: person.contact_email,
          address: person.contact_address,
          phoneNumber: person.contact_phone,
          favoritePlace: person.contact_favoriteplace,
          favoritePlaceURL: person.contact_favoriteplaceurl
        });
      }
      res.set("Content-Type", "text/plain");
      res.status(200).json(contacts);
    });
  });
});
// POST method to insert details of a new contact to tbl_contacts table
app.post("/postContact", function(req, res) {
  var con = mysql.createConnection({
    host: json.dbconfig.host[0],
    user: json.dbconfig.user[0], // replace with the database user provided to you
    password: json.dbconfig.password[0], // replace with the database password provided to you
    database: json.dbconfig.database[0], // replace with the database user provided to you
    port: json.dbconfig.port[0]
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    }

    var bod = req.body;
    var name = bod.contactName;
    var email = bod.email;
    var address = bod.address;
    var phone = bod.phoneNumber;
    var favoriteplace = bod.favoritePlace;
    var favoriteplaceURL = bod.favoritePlaceURL;
    var first =
      "INSERT INTO tbl_contacts (contact_name, contact_email, contact_address, contact_phone, contact_favoriteplace, contact_favoriteplaceurl) VALUES ";
    var second =
      "('" +
      name +
      "','" +
      email +
      "','" +
      address +
      "','" +
      phone +
      "','" +
      favoriteplace +
      "','" +
      favoriteplaceURL +
      "')";
    var sql = first + second;

    con.query(sql, function(err, result) {
      if (err) {
        throw err;
      }
      console.log("1 record inserted");
      res.redirect("/contact");
    });
  });
});

// POST method to validate user login
// upon successful login, user session is created
app.post("/sendLoginDetails", function(req, res) {
  var bod = req.body;
  var con = mysql.createConnection({
    host: json.dbconfig.host[0],
    user: json.dbconfig.user[0], // replace with the database user provided to you
    password: json.dbconfig.password[0], // replace with the database password provided to you
    database: json.dbconfig.database[0], // replace with the database user provided to you
    port: json.dbconfig.port[0]
  });

  con.connect(function(err) {
    if (err) {
      throw err;
    }
    con.query("SELECT * FROM tbl_accounts", function(err, result, fields) {
      if (err) {
        throw err;
      }
      var username = req.body.Username;
      var sess = req.session;
      var password = crypto
        .createHash("sha256")
        .update(req.body.Password)
        .digest("base64");
      for (var x = 0; x < result.length; x++) {
        resu = result[x];
        if (resu.acc_login == username && resu.acc_password == password) {
          sess.value = 1;

          sess.user_id = resu.acc_id;
          user = resu.acc_login;
          sess.save();
          res.write(JSON.stringify({ Stuff: true }));
          res.end();
        }
      }
      if (!req.session.value) {
        res.write(JSON.stringify({ Stuff: false }));
        res.end();
      }
    });
  });
});

app.get("/admin", function(req, res) {
  if (!req.session.value) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + "/client/adminpage.html");
  }
});

app.get("/userLogin", function(req, res) {
  res.set("Content-Type", "text/plain");
  res.send({ login: user });
});

app.post("/updateUsers", function(req, res) {
  var con = mysql.createConnection({
    host: json.dbconfig.host[0],
    user: json.dbconfig.user[0], // replace with the database user provided to you
    password: json.dbconfig.password[0], // replace with the database password provided to you
    database: json.dbconfig.database[0], // replace with the database user provided to you
    port: json.dbconfig.port[0]
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    }
    con.query(
      "SELECT * FROM tbl_accounts WHERE acc_login = ?",
      [req.body.login],
      function(err, newAdded, fields) {
        if (err) {
          throw err;
        }
        var size = newAdded.length;
        if (size > 1) {
          res.send({ flag: false });
        } else {
          var pass;
          if (!req.body.password) {
            con.query(
              "SELECT * FROM tbl_accounts WHERE acc_id = ?",
              [req.body.id],
              function(err, results, fields) {
                if (err) {
                  throw err;
                }
                pass = results[0].acc_password;
                makeQuery(req, pass, con);
                res.send({ flag: true });
              }
            );
          } else {
            pass = crypto
              .createHash("sha256")
              .update(req.body.password)
              .digest("base64");
            makeQuery(req, pass, con);
            res.send({ flag: true });
          }
        }
      }
    );
  });
});
function makeQuery(req, pass, con) {
  var user = req.body.login;
  var name = req.body.name;
  var varID = req.body.id;
  var sql =
    "UPDATE tbl_accounts SET acc_name = ?, acc_login= ?, acc_password = ? WHERE acc_id = ?";
  con.query(sql, [name, user, pass, varID], function(err, result) {
    if (err) {
      throw err;
    }
  });
}
app.post("/deleteUsers", function(req, res) {
  if (req.body.login == user) {
    res.send({ flag: false });
  } else {
    var con = mysql.createConnection({
      host: json.dbconfig.host[0],
      user: json.dbconfig.user[0], // replace with the database user provided to you
      password: json.dbconfig.password[0], // replace with the database password provided to you
      database: json.dbconfig.database[0], // replace with the database user provided to you
      port: json.dbconfig.port[0]
    });

    con.connect(function(err) {
      var sql = `DELETE FROM tbl_accounts WHERE acc_login = ?`;
      con.query(sql, [req.body.login], function(err, result) {
        if (err) {
          throw err;
        }
        res.send({ flag: true });
      });
    });
  }
});

app.post("/postUser", function(req, res) {
  var con = mysql.createConnection({
    host: json.dbconfig.host[0],
    user: json.dbconfig.user[0], // replace with the database user provided to you
    password: json.dbconfig.password[0], // replace with the database password provided to you
    database: json.dbconfig.database[0], // replace with the database user provided to you
    port: json.dbconfig.port[0]
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    }
    console.log("Connected!");
    con.query(
      "SELECT * FROM tbl_accounts WHERE acc_login = ?",
      [req.body.login],
      function(err, newAdded, fields) {
        if (err) {
          throw err;
        }
        var size = newAdded.length;
        if (size > 0 || req.body.password == "") {
          res.send({ flag: false });
        } else {
          var rowToBeInserted = {
            acc_name: req.body.name, // replace with acc_name chosen by you OR retain the same value
            acc_login: req.body.login, // replace with acc_login chosen by you OR retain the same vallue
            acc_password: crypto
              .createHash("sha256")
              .update(req.body.password)
              .digest("base64") // replace with acc_password chosen by you OR retain the same value
          };
          con.query("INSERT tbl_accounts SET ?", rowToBeInserted, function(
            err,
            result
          ) {
            if (err) {
              throw err;
            }
            con.query(
              "SELECT * FROM tbl_accounts WHERE acc_login = ?",
              [req.body.login],
              function(err, newAdded, fields) {
                if (err) {
                  throw err;
                }
                res.send({ id: newAdded[0].acc_id, flag: true });
              }
            );
          });
        }
      }
    );
  });
});

app.get("/getListOfUsers", function(req, res) {
  var con = mysql.createConnection({
    host: json.dbconfig.host[0],
    user: json.dbconfig.user[0], // replace with the database user provided to you
    password: json.dbconfig.password[0], // replace with the database password provided to you
    database: json.dbconfig.database[0], // replace with the database user provided to you
    port: json.dbconfig.port[0]
  });
  con.connect(function(err) {
    if (err) {
      throw err;
    }
    con.query("SELECT * FROM tbl_accounts", function(err, result, fields) {
      if (err) {
        throw err;
      }
      var accounts = {
        account: []
      };
      for (var i in result) {
        var person = result[i];
        accounts.account.push({
          id: person.acc_id,
          name: person.acc_name,
          login: person.acc_login,
          password: person.acc_password
        });
      }
      res.send(accounts);
    });
  });
});
// log out of the application
// destroy user session
app.get("/logout", function(req, res) {
  req.session.destroy();
  res.redirect("/login");
});

// middle ware to serve static files
app.use("/client", express.static(__dirname + "/client"));

// function to return the 404 message and error to client
app.get("*", function(req, res) {
  res.sendStatus(404);
});
