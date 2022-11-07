const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {Customer} = require("../models/customer");
const {Movie} = require("../models/movie");
const {Rental, validateRental: validate, rentalSchema} = require("../models/rental");


router.get("/",  async (req, res) => {
    const rentals = await Rental.find().sort("-dateOut");
    res.send(rentals);
});

router.post("/", auth, async (req, res) => {
    const { error } = validate(req.body);
    const { customerId, movieId } = req.body;

    if (error) return res.status(400).send(error.details[0].message);
    
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(400).send("Invalid customer.");
    
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(400).send("Invalid movie.");

    if (movie.numberInStock === 0) return res.writeHead(400).send("I'm sorry, the movie is out of stock, would you like to select another?");

    let rental = new Rental({ 
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        }, 
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    try {
        rental = await rental.save();
        movie.numberInStock--;
        await movie.save();
        res.send(rental);
    } catch (ex) {
        res.send(ex.message)
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const rental = await Rental.findById(id);
    res.send(rental);
})

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const { error } = validate(req.body);   
    if (error) return res.status(400).send(error.details[0].message);
    const movie = await Rental.findByIdAndUpdate(id, { title, genre, numberInStock, dailyRentalRate }, { new: true });
    notFound(movie, res);
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const rental = await Rental.findByIdAndRemove(id);
    notFound(rental, res);
})


module.exports = router;