const Joi = require("joi");
const mongoose = require("mongoose");
const {genreSchema} = require("./genre");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        min: 5, 
        max: 50, 
        required: true
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number,
        min: 0,
        max: 10000,
        required: true
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0
    }
});

const Movie = mongoose.model("Movie", movieSchema);


function movieNotFound(movie, res) {
    if (!movie) {return res.send("The movie with the given ID was not found.")}
    res.send(movie);
}


function validateMovie(movie) {
    const schema = Joi.object({
      title: Joi.string().required().min(5).max(50),
      genreId: Joi.objectId().required(),
      numberInStock: Joi.number().min(0).max(10000).required(),
      dailyRentalRate: Joi.number().min(0).required()
    });

    return schema.validate(movie);
}

exports.Movie = Movie;
exports.movieSchema = movieSchema;
exports.movieNotFound = movieNotFound;
exports.validateMovie = validateMovie;