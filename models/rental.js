const Joi = require("joi");
const moment = require("moment");
const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name: {
                type: String, 
                min: 5, 
                max: 50, 
                required: true
            },
            isGold: {
                type: Boolean,
                default: false
            },
            phone: {
                type: String,
                required: true,
                min: 11,
                max: 15
            }
        }),
        required: true
    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                trim: true,
                min: 5, 
                max: 50, 
                required: true
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateIn: Date,
    totalRental: {
        type: Number,
        min: 0
    },
});

rentalSchema.statics.lookup = function(customerId, movieId) {
    return this.findOne({ 
        "customer._id": customerId, 
        "movie._id": movieId 
    });
}

rentalSchema.methods.return = function() {
    this.dateIn = new Date();
    
    const rentalDays = moment().diff(this.dateOut, "days")
    this.totalRental = rentalDays * this.movie.dailyRentalRate;
}

const Rental = mongoose.model("Rental", rentalSchema);

function rentalNotFound(rental, res) {
    if (!rental) return res.status(404).send("The rental with the given ID was not found.")
    res.send(rental);
}


function validateRental(rental) {
    const schema = Joi.object({
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required(),
    });

    return schema.validate(rental);
}

exports.Rental = Rental;
exports.rentalSchema = rentalSchema;
exports.rentalNotFound = rentalNotFound;
exports.validateRental = validateRental;