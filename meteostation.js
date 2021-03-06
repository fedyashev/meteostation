var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var handlebars = require("express-handlebars");
var morgan = require("morgan");
var path = require("path");
var mongoose = require("mongoose");

var index = require("./routes/index");
var api = require("./routes/api");

var credentials = require("./credentials.js");

// Set mongoDB connection
mongoose.connect(credentials.mongo.connectionString, {
  server: {
    socketOptions: {keepAlive: 1},
  },
});

var app = express();
var port = process.env.PORT || 3000;

// Set template engine
app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Set middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan("short"));

// Set router
app.use("/", index);
app.use("/api", api);

app.listen(port, function() {
  console.log("Server started at " + port);
});