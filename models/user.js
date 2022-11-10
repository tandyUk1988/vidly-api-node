const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        min: 5, 
        max: 50, 
        required: true
    },
    email: {
        type: String,
        min: 5,
        max: 255,
        required: true,
        unique: true
    },
    password: {
        type: String,
        min: 5,
        max: 1024,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },

});

userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id, name: this.name, email: this.email, isAdmin: this.isAdmin }, config.get("jwtPrivateKey"));
}

const User = mongoose.model("User", userSchema);



function userNotFound(user, res) {
    if (!user) return res.status(404).send("The user with the given ID was not found.")
    res.send(user);
}


function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required().min(5).max(50),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        isAdmin: Joi.boolean()
    });

    return schema.validate(user);
}

exports.User = User;
exports.userNotFound = userNotFound;
exports.validateUser = validateUser;