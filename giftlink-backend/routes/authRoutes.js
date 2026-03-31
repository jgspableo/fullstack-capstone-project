const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pino = require('pino');
const { body, validationResult } = require('express-validator');
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

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await collection.findOne({ email: normalizedEmail });

    if (existingUser) {
      logger.info('Registration failed: email already exists');
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);

    const user = {
      email: normalizedEmail,
      password: hash,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(user);

    const authtoken = jwt.sign(
      {
        user: {
          id: result.insertedId.toString(),
        },
      },
      JWT_SECRET || 'setasecret'
    );

    logger.info('User registered successfully');
    return res.json({ authtoken, email: normalizedEmail });
  } catch (e) {
    logger.error(e);
    return res.status(500).send('Internal server error');
  }
});

router.put(
  '/update',
  [
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const headerEmail = req.header('email');

      if (!headerEmail) {
        return res.status(400).json({
          message: 'Email header is required',
        });
      }

      const email = headerEmail.trim().toLowerCase();

      const db = await connectToDatabase();
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });

      if (!existingUser) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      const updateFields = {
        updatedAt: new Date(),
      };

      if (req.body.password) {
        const salt = await bcryptjs.genSalt(10);
        updateFields.password = await bcryptjs.hash(req.body.password, salt);
      }

      if (Object.keys(updateFields).length === 1) {
        return res.status(400).json({
          message: 'No valid fields to update',
        });
      }

      await usersCollection.updateOne(
        { _id: existingUser._id },
        { $set: updateFields }
      );

      const authtoken = jwt.sign(
        {
          user: {
            id: existingUser._id.toString(),
          },
        },
        JWT_SECRET || 'setasecret'
      );

      logger.info('User updated successfully');
      return res.json({ authtoken });
    } catch (e) {
      logger.error(e);
      return res.status(500).send('Internal server error');
    }
  }
);

module.exports = router;
