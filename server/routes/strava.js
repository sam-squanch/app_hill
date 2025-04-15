const express = require('express');
const axios = require('axios');
const router = express.Router();

let accessToken = null;

router.get('/auth', (req, res) => {
  const url = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=activity:read_all`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  try {
    const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: req.query.code,
      grant_type: 'authorization_code'
    });

    accessToken = tokenRes.data.access_token;
    res.redirect('https://app-hill.vercel.app'); // Frontend dev server
  } catch (e) {
    res.status(500).send('Auth failed');
  }
});

router.get('/activities', async (req, res) => {
  if (!accessToken) return res.status(401).send('Not authenticated');

  try {
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json(response.data);
  } catch (e) {
    res.status(500).send('Failed to fetch activities');
  }
});

module.exports = router;
