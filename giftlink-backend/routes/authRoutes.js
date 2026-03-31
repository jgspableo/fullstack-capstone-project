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

module.exports = router;
