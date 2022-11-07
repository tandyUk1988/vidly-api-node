const Joi = require("joi");
const mongoose = require("mongoose");


const Customer = mongoose.model("Customer", new mongoose.Schema({
    name: {
        type: String, 
        min: 5, 
        max: 50, 
        required: true
    },
    isGold: {
        type: Boolean,
        required: true
    },
    phone: {
        type: String,
        required: true,
        min: 11,
        max: 15
    }
}));


function customerNotFound(customer, res) {
    if (!customer) return res.status(404).send("The customer with the given ID was not found.")
    res.send(customer);
}


function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().required().min(5).max(50),
        isGold: Joi.boolean().required(),
        phone: Joi.string().required().min(11).max(15)
    });

    return schema.validate(customer);
}

exports.Customer = Customer;
exports.customerNotFound = customerNotFound;
exports.validateCustomer = validateCustomer;