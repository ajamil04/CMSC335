const path = require("path");
// const http = require("http");
const fetch = require('node-fetch');
const express = require("express");

require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});

const databaseAndCollection = {db: "CMSC335Final", collection:"userScores"};
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const portNumber = process.env.PORT;

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

    if (data.error) {
        console.error("Error getting Spotify access token:", data.error);
        throw new Error("Unable to get Spotify access token.");
    }

    console.log("Spotify Access Token:", data.access_token);

    return data.access_token;
}

async function getArtist(name, token) {
    try {
        const artistResponse = await fetch(
            `https://api.spotify.com/v1/search?q=artist:${artistName}&type=artist`,
            {
                headers: { Authorization: `Bearer ${token}`},
            }
        );
    
        if (!artistResponse.ok) {
            throw new Error(`Spotify API error: ${artistResponse.statusText}`);
        }
    
        const artistData = await artistResponse.json();
    
        if (artistData.artists.items.length === 0) {
            throw new Error("Artist not found");
        }
    
        const artist = artistData.artists.items[0];
    
        const topTracksResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?country=US`,
            {
                headers: { Authorization: `Bearer ${token}`},
            }
        );
    
        if (!topTracksResponse.ok) {
            throw new Error(`Top tracks API error: ${topTracksResponse.statusText}`);
        }
    
        const topTracksData = await topTracksResponse.json();
    
        const albumsResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artist.id}/albums`,
            {
                headers: { Authorization: `Bearer ${token}`},
            }
        );
    
        if (!albumsResponse.ok) {
            throw new Error(`Albums API error: ${albumsResponse.statusText}`);
        }
    
        const albumsData = await albumsResponse.json();
    
        const similarArtistsResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artist.id}/related-artists`,
            {
                headers: { Authorization: `Bearer ${token}`},
            }
        );
    
        if (!similarArtistsResponse.ok) {
            throw new Error(`Similar artists API error: ${similarArtistsResponse.statusText}`);
        }
    
        const similarArtistsData = await similarArtistsResponse.json();
    
        return {
            name: artist.name,
            topTracks: topTracksData.tracks,
            albums: albumsData.albums,
            similarArtists: similarArtistsData.artists,
        };
    } catch (error) {
        console.error("Error fetching artist data:", error); 
        throw error; 
    }
}

async function storeSearchData(name) {
    const uri = process.env.MONGO_DB_PASSWORD;
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

    try {        
        await client.connect();

        await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .insertOne({name});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    } 
}

app.get("/", (req, res) => {
    res.render("index", { artistData: null });
})

app.post("/", async (req, res) => {
    try {
        const name = req.body.name;
        const token = await getSpotifyAccessToken();
        const artistData = await getArtist(name, token);

        await storeSearchData(name);

        res.render("index", {artistData});
    } catch (error) {
        console.error("Error:", error);  // Log the error to the console
        res.status(500).send("An error occurred while fetching the song data.");
    }
});

app.listen(portNumber, () => {
    console.log(`Server running on http://localhost:${portNumber}`);
});