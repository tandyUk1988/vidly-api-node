const Joi = require("joi");
const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
    name: {
        type: String, 
        min: 5, 
        max: 50, 
        required: true
    }
});


const Genre = mongoose.model("Genre", genreSchema);


function genreNotFound(genre, res) {
    if (!genre) return res.status(404).send("The genre with the given ID was not found.")
    res.send(genre);
}


function validateGenre(genre) {
    const schema = Joi.object({
        name: Joi.string().required().min(5).max(50)
    });

    return schema.validate(genre);
}

exports.Genre = Genre;
exports.genreSchema =  genreSchema;
exports.genreNotFound = genreNotFound;
exports.validateGenre = validateGenre;