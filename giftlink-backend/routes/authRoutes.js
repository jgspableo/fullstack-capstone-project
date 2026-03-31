const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pino = require('pino');
const connectToDatabase = require('../models/db');

dotenv.config();

const logger = pino();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('users');

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      logger.info('Registration failed: email already exists');
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);

    const user = {
      email,
      password: hash,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(user);

    const authtoken = jwt.sign(
      { user: { id: result.insertedId.toString() } },
      JWT_SECRET
    );

    logger.info('User registered successfully');
    res.json({ authtoken, email });
  } catch (e) {
    logger.error(e);
    return res.status(500).send('Internal server error');
  }
});

module.exports = router;
