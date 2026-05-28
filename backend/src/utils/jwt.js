'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const { secret, expiry } = env.jwt;

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: expiry });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };
