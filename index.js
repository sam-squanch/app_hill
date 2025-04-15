const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

let accessToken = null; // TEMP: store in memory (not safe for production)

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Strava Web App</h1>
    <p><a href="/auth">Log in with Strava</a></p>
  `);
});

app.get('/auth', (req, res) => {
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=activity:read_all`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    accessToken = tokenRes.data.access_token;

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send('Something went wrong during authentication.');
  }
});

app.get('/dashboard', async (req, res) => {
  if (!accessToken) {
    return res.redirect('/');
  }

  try {
    const activityRes = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const activities = activityRes.data.map(act => `<li>${act.name} – ${(act.distance / 1000).toFixed(2)} km</li>`).join('');

    res.send(`
      <h1>Your Recent Strava Activities</h1>
      <ul>${activities}</ul>
      <p><a href="/">Back to Home</a></p>
    `);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send('Something went wrong fetching activities.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
