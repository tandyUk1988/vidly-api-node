const express = require("express");
const router = express.Router();
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const {Genre, genreNotFound} = require("../models/genre");
const { Movie, movieNotFound: notFound, validateMovie: validate } = require("../models/movie");

router.get("/",  async (req, res) => {
    const movies = await Movie.find().sort("title");
    res.send(movies);
});


router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    const { title, genreId, numberInStock, dailyRentalRate } = req.body;
    const genre = await Genre.findById(genreId);
    genreNotFound(genre, res);

    if (error) return res.status(400).send(error.details[0].message);

    const movie = new Movie({ 
        title, 
        genre: {
            _id: genre._id,
            name: genre.name
        }, 
        numberInStock, 
        dailyRentalRate
     });
    await movie.save();
    res.status(201).send(movie);
})


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    res.send(movie);
})


router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, genre, numberInStock, dailyRentalRate } = req.body;

    const { error } = validate(req.body);   
    if (error) return res.status(400).send(error.details[0].message);
    const movie = await Movie.findByIdAndUpdate(id, { title, genre, numberInStock, dailyRentalRate }, { new: true });
    notFound(movie, res);
})


router.delete("/:id", [auth, admin], async (req, res) => {
    const { id } = req.params;
    const movie = await Movie.findByIdAndRemove(id);
    notFound(movie, res);
})


module.exports = router;