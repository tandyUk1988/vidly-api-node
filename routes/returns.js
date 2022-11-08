const express = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");
const router = express.Router();

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const {Movie} = require("../models/movie");
const {Rental} = require("../models/rental");

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
    const { customerId, movieId } = req.body;
  
    const rental = await Rental.lookup(customerId, movieId);

    if (!rental) return res.status(404).send("I'm sorry, no rental exists with that combination of customer and movie");
    if (rental.dateIn) return res.status(400).send("This rental has already been processed");

    rental.return();
    await rental.save();

    await Movie.updateOne({ _id: rental.movie._id}, {
        $inc: { numberInStock: 1 }
    });

    return res.send(rental);
});

function validateReturn(req) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });

    return schema.validate(req);
}

module.exports = router;