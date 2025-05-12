const express = require('express');
const mongoose = require('mongoose');
const { port, mongoUri, appName } = require('./config');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

mongoose.connect(mongoUri)
  .then(() => console.log(`${appName} connected to MongoDB`))
  .catch(err => console.error(err));

app.listen(port, () => console.log(`${appName} listening on port ${port}`));
