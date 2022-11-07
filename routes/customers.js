const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
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


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    res.send(customer);
})


router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const { error } = validate(req.body);   
    if (error) return res.status(400).send(error.details[0].message);
    const customer = await Customer.findByIdAndUpdate(id, { name }, { new: true });
    notFound(customer, res);
})


router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const customer = await Customer.findByIdAndRemove(id);
    notFound(customer, res);
})


module.exports = router;