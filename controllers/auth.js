const express = require("express");
const register = require("./register")
const login = require("./login.js");
const router = express.Router();
router.post("/register", register)
router.post("/login", login)


module.exports = router;

