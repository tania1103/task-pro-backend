/**
 * @file routes/index.js
 * @description Central export point for all API routes
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const boardRoutes = require('./boardRoutes');
const columnRoutes = require('./columnRoutes');
const cardRoutes = require('./cardRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// API route groups
router.use('/auth', authRoutes);
router.use('/boards', boardRoutes);
router.use('/columns', columnRoutes);
router.use('/cards', cardRoutes);
router.use('/users', userRoutes);

module.exports = router;
