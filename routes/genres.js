const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectID = require("../middleware/validateObjectID");
const {Genre, validateGenre: validate} = require("../models/genre");


router.get("/", async (req, res) => {
    const genres = await Genre.find().sort("name");
    res.send(genres);
});

router.get("/:id", validateObjectID, async (req, res) => {
    const { id } = req.params;
    
    const genre = await Genre.findById(id);

    if (!genre) return res.status(404).send("The genre with the given ID was not found");

    res.send(genre);
});

router.post("/", auth, async (req, res) => {
    const { name } = req.body;
    const { error } = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    let genre = new Genre({ name });
    genre = await genre.save();

    res.status(200).send(genre);
});

router.put("/:id", [auth, validateObjectID], async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const { error } = validate(req.body);   
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(id, { name }, { new: true });

    if (!genre) return res.status(404).send("The genre with the given ID was not found.")

    res.send(genre)
});


router.delete("/:id", [auth, admin], async (req, res) => {
    const { id } = req.params;
    const genre = await Genre.findByIdAndRemove(id);
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
});


module.exports = router;
