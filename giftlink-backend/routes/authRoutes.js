const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const db = await connectToDatabase();
      const usersCollection = db.collection('users');

      const firstName = req.body.firstName.trim();
      const lastName = req.body.lastName.trim();
      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password;

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          message: 'Email is already registered',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const name = `${firstName} ${lastName}`.trim();

      const result = await usersCollection.insertOne({
        firstName,
        lastName,
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      const token = jwt.sign(
        {
          userId: result.insertedId.toString(),
          email,
          name,
        },
        process.env.JWT_SECRET || 'setasecret',
        { expiresIn: '1h' }
      );

      return res.status(201).json({
        token: `Bearer ${token}`,
        name,
        email,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      // Task 1: Connect to MongoDB through connectToDatabase in db.js
      const db = await connectToDatabase();

      // Task 2: Access users collection
      const usersCollection = db.collection('users');

      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password;

      // Task 3: Check for user credentials in database
      const user = await usersCollection.findOne({ email });

      // Task 7: Send appropriate message if user not found
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      // Task 4: Check if password matches encrypted password
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({
          message: 'Incorrect password',
        });
      }

      // Task 5: Fetch user details from database
      const userName =
        user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const userEmail = user.email;

      // Task 6: Create JWT authentication with user._id as payload
      const authtoken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'setasecret',
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        authtoken: `Bearer ${authtoken}`,
        userName,
        userEmail,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
