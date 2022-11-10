const _ = require("lodash");
const bcrypt = require("bcrypt");
const config = require("config");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const {User, validateUser, userNotFound} = require("../models/user");

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user)
})

router.post("/", async (req, res) => {
    const { error } = validateUser(req.body);
    const { name, email, password } = req.body;

    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email });
    if (user) return res.status(400).send("This user is already registered.");

    user = new User(_.pick(req.body, ["name", "email", "password", "isAdmin"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    
    res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["name", "email", "isAdmin"]));
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndRemove(id);
    userNotFound(user, res);
})

module.exports = router;