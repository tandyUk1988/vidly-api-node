const express = require("express");
const router = express.Router();
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectID = require("../middleware/validateObjectID");
const { Customer, customerNotFound: notFound, validateCustomer: validate } = require("../models/customer");

router.get("/",  async (req, res) => {
    const customers = await Customer.find().select({ name: 1, phone: 1}).sort("name");
    res.send(customers);
});


router.post("/", auth, async (req, res) => {
    const { error } = validate(req.body);
    const { name, isGold, phone } = req.body;

    if (error) return res.status(400).send(error.details[0].message);

    const customer = new Customer({ 
        name, isGold, phone
     });
    await customer.save();
    res.status(201).send(customer);
})


router.get("/:id", validateObjectID, async (req, res) => {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    res.send(customer);
})


router.put("/:id", [auth, validateObjectID], async (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;

    const { error } = validate(req.body);   
    if (error) return res.status(400).send(error.details[0].message);
    const customer = await Customer.findByIdAndUpdate(id, { name, phone }, { new: true });
    notFound(customer, res);
})


router.delete("/:id", [auth, admin], async (req, res) => {
    const { id } = req.params;
    const customer = await Customer.findByIdAndRemove(id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
})


module.exports = router;