const express = require("express");
const Item = require("@/models/Item");
const authMiddleware = require("@/middleware/authMiddleware");
require("dotenv").config();

// Initialize Router
const router = express.Router();
