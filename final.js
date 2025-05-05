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
    try {
        const token = await getSpotifyAccessToken();

        const response = await fetch(
            "https://api.spotify.com/v1/search?q=Taylor+Swift&type=track&limit=50",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        // Log the API response for debugging
        console.log("API Response:", data);

        if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
            throw new Error("No tracks found for Taylor Swift.");
        }

        const songs = data.tracks.items.filter(song => song.preview_url);
        if (songs.length === 0) {
            throw new Error("No songs with previews found.");
        }

        const randomSong = songs[Math.floor(Math.random() * songs.length)];

        res.render("index", {
            name: randomSong.name,
            artist: randomSong.artists[0].name,
            preview_url: randomSong.preview_url,
        });
    } catch (error) {
        console.error("Error:", error);  // Log the error to the console
        res.status(500).send("An error occurred while fetching the song data.");
    }
});

app.listen(portNumber, () => {
    console.log(`Server running on http://localhost:${portNumber}`);
});