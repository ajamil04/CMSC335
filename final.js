const path = require("path");
const http = require("http");
const fetch = require("node-fetch");
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



async function getSpotifyAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.envSPOTIFY_CLIENT_SECRET;

    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString();
    
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`
        }
    });

    const data = await response.json();
    return data.access_token;
}

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/songPreviews", async (req, res) => {
    const token = await getSpotifyAccessToken();

    const response = await fetch(
        `https://api.spotify.com/v1/search?q=artist:taylor+swift&type=track&limit=50`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();
    const songs = data.songs.items.filter(songs => songs.preview_url);

    const randomizeSongs = songs[Math.random()*songs.length];

    res.json( {
        name: randomizeSongs.name,
        artist: randomizeSongs.artists[0].name,
        preview_url: randomizeSongs.preview_url
    });
});

window.addEventListener("DOMContentLoaded", async() => {
    const response = await fetch("/songPreviews");
    const data = await response.json();

    const audio = new Audio(data.preview_url);
    audio.play();

    document.body.innerHTML += `<p>Now playing: <strong>${data.name}</strong> by ${data.artist}</p>`;
});

app.listen(portNumber, () => {
    console.log(`Server running on http://localhost:${portNumber}`);
});