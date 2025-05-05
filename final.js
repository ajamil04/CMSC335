const path = require("path");
const http = require("http");
const express = require("express");

require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});

const databaseAndCollection = {db: "CMSC335Final", collection:"userScores"};
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const portNumber = process.argv[2];

const httpSuccessStatus = 200;
const finalProjectServer = http.createServer((request, response) => {
    response.writeHead(httpSuccessStatus, {'Content-type':'text/html'});
    response.end();
});

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use(express.urlencoded({extended:false}));

app.get("/", (req, res) => {
    res.render("index");
})