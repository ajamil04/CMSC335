const path = require("path");
const http = require("http");
const express = require("express");

require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});

const databaseAndCollection = {db: "CMSC335Final", collection:"userScores"};
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const portNumber = process.env.PORT;

const httpSuccessStatus = 200;
const finalProjectServer = http.createServer((request, response) => {
    response.writeHead(httpSuccessStatus, {'Content-type':'text/html'});
    response.end();
});

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({extended:false}));

app.get("/", (req, res) => {
    res.render("index");
})

app.listen(portNumber, () => {
    console.log(`Server running on http://localhost:${portNumber}`);
});