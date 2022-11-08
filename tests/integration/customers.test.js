const mongoose = require("mongoose");
const request = require("supertest");
const {Customer} = require("../../models/customer");
const {User} = require("../../models/user");

describe("/api/customers", () => {
    beforeEach(() => { 
        jest.setTimeout(() => {}, 100000);
        server = require("../../server"); });
    afterEach(async () => { 
        await server.close(); 
        await Customer.deleteMany({});
    });

    describe("GET /", () => {
        it("should return all customers", async () => {
            await Customer.collection.insertMany([
                { name: "customer1" },
                { name: "customer2" },
            ]);
            const res = await request(server).get("/api/customers");
            const {status, body} = res;
    
            expect(status).toBe(200);
            expect(body.length).toBe(2);
            expect(body.some(c => c.name === "customer1")).toBeTruthy();
            expect(body.some(c => c.name === "customer2")).toBeTruthy();
        });
    });

    describe("GET /:id", () => {
        it("should return a customer if valid ID is passed", async () => {
            const customer = new Customer({ name: "customer1", phone: "012345678910" });
            await customer.save();

            const {body, status} = await request(server).get("/api/customers/" + customer._id);

            expect(status).toBe(200);
            expect(body).toHaveProperty("name");
        });

        it("should return 404 if invalid ID is passed", async () => {
            const {status} = await request(server).get("/api/customers/1");

            expect(status).toBe(404);
        });
        it("should return 404 if no customer with the given ID exists", async () => {
            const id = mongoose.Types.ObjectId().toHexString();

            const {status} = await request(server).get("/api/customer/" + id);

            expect(status).toBe(404);
        });
    });

    describe("POST /", () => {
        let name;
        let phone;
        let token;
       
        const exec = async () => {
            return await request(server)
            .post("/api/customers")
            .set("x-auth-token", token)
            .send({ name, phone });
        };

        beforeEach(() => {
            name = "customer1";
            phone = "12345678910"
            token = new User().generateAuthToken();
        })

        it("should save the customer if it is valid", async () => {
            await exec();

            const customer = await Customer.find({ name: "customer1" });

            expect(customer).not.toBeNull();
        });

        it("should return the customer if it is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "customer1");
            expect(res.body).toHaveProperty("phone", "12345678910");
        });

        it("should return a 400 if customer name is less than 5 characters", async () => {
            name = "1234";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return a 400 if customer name is more than 50 characters", async () => {
            name = new Array(52).join("a");

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return a 400 if customer phone # is less than 11 characters", async () => {
            phone = "123456789";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return a 400 if customer phone # is more than 15 characters", async () => {
            phone = new Array(17).join("a");

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return a 401 if client is not logged in", async () => {
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });
    });

    describe("PUT /:id", () => {
        let customer;
        let id;
        let newName;
        let newPhone;
        let token;

        const exec = async () => {
            return await request(server)
                .put("/api/customers/" + id)
                .set("x-auth-token", token)
                .send({ name: newName, phone: newPhone })
        };

        beforeEach( async () => {
            customer = new Customer({ name: "customer1", phone: "12345678910" });
            await customer.save();

            id = customer._id;
            newName = "altered customer";
            newPhone = "10987654321";
            token = new User().generateAuthToken();
        });

        it("should update the customer if input is valid", async () => {
            await exec();

            const updatedCustomer = await Customer.findById(id);
      
            expect(updatedCustomer.name).toBe(newName);
            expect(updatedCustomer.phone).toBe(newPhone);
        });

        it("should return the updated customer if it is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
            expect(res.body).toHaveProperty('phone', newPhone);
        });

        it('should return 400 if customer name is less than 5 characters', async () => {
            newName = "1234";

            const {status} = await exec();

            expect(status).toBe(400);
        });
        
        it('should return 400 if customer name is more than 50 characters', async () => {
            newName = new Array(52).join("a");

            const {status} = await exec();

            expect(status).toBe(400);
        });
 
        it('should return 400 if customer phone number is less than 11 characters', async () => {
            newPhone = "123456789"

            const {status} = await exec();

            expect(status).toBe(400);
        });

        it('should return 400 if customer phone number is more than 15 characters', async () => {
            newPhone = new Array(17).join("a");

            const {status} = await exec();

            expect(status).toBe(400);
        });

        
        it("should return a 401 if client is not logged in", async () => {
            token = "";

            const { status } = await exec();

            expect(status).toBe(401);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const {status} = await exec();

            expect(status).toBe(404);
        });

        it('should return 404 if customer with the given ID was not found', async () => {
            id = mongoose.Types.ObjectId();

            const {status} = await exec();
            
            expect(status).toBe(404);
        });
    });

    describe("DELETE /:id", () => {
        let customer;
        let token;
        let id;
        
        const exec = async () => {
            return await request(server)
            .delete(`/api/customers/${id}` )
            .set("x-auth-token", token)
            .send();
        };

        beforeEach( async () => {
            customer = new Customer({ name: 'customer1' });
            await customer.save();
            
            id = customer._id; 
            token = new User({ _id: 1, isAdmin: true }).generateAuthToken();     
        });

        it("should return a 401 if client is not logged in", async () => {
            token = "";

            const {status} = await exec();

            expect(status).toBe(401);
        });

        it("should return a 403 if the user is not an admin", async () => {
            token = new User({ isAdmin: false }).generateAuthToken(); 

            const {status} = await exec();

            expect(status).toBe(403);
        });

        it("should return a 404 if the customer ID doesn't exist", async () => {
            id = mongoose.Types.ObjectId();

            const {status} = await exec();

            expect(status).toBe(404);
        });

        it("should delete the input if ID is valid", async () => {
            await exec();

            const customerInDb = await Customer.findById(id);

            expect(customerInDb).toBeNull();
        });

        it("should return the removed customer", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id", customer._id.toHexString() );
            expect(res.body).toHaveProperty("name", customer.name);
            expect(res.body).toHaveProperty("isGold", customer.isGold);
            expect(res.body).toHaveProperty("phone", customer.phone);
        })
    });
});