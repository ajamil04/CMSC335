const path = require("path");
const http = require("http");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require("express");

require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});

const databaseAndCollection = {db: "CMSC335Final", collection:"userScores"};
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const portNumber = process.env.PORT;

// const httpSuccessStatus = 200;
// const finalProjectServer = http.createServer((request, response) => {
//     response.writeHead(httpSuccessStatus, {'Content-type':'text/html'});
//     response.end();
// });

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({extended:false}));

async function getSpotifyAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${creds}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token;
}

app.get("/", async (req, res) => {
    const token = await getSpotifyAccessToken();

    const response = await fetch(
        "https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02/top-tracks?market=US",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();
    const songs = data.tracks.items.filter(songs => songs.preview_url);

    console.log("API Response Items:", data.tracks.items);

    if (!songs.length) {
        return res.send("No songs with previews found.");
    }
    
    const randomizeSongs = songs[Math.floor(Math.random()*songs.length)];

    if (!randomSong || !randomSong.name || !randomSong.artists || !randomSong.preview_url) {
        return res.send("Random song is missing data.");
    }
    
    res.render("index", {
        name: randomizeSongs.name,
        artist: randomizeSongs.artists[0].name,
        preview_url: randomizeSongs.preview_url
    });
});

app.listen(portNumber, () => {
    console.log(`Server running on http://localhost:${portNumber}`);
});