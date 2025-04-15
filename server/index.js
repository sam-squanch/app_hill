const express = require('express');
const cors = require('cors');
const stravaRoutes = require('./routes/strava');
require('dotenv').config();

const app = express();
app.use(cors());
app.use('/api', stravaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
