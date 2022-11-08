const moment = require("moment");
const mongoose = require("mongoose");
const request = require("supertest");
const {Movie} = require("../../models/movie");
const {Rental} = require("../../models/rental");
const {User} = require("../../models/user");

describe("/api/returns", () => {
    let server;
    let customerId;
    let movie;
    let movieId;
    let rental;
    let token;

    beforeEach( async () => {
        jest.setTimeout(500000);
        server = require("../../server"); 

        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: "12345",
            dailyRentalRate: 2,
            numberInStock: 10,
            genre: { name: "12345" },
        });

        rental = new Rental({
            customer: {
                _id: customerId,
                name: "12345",
                phone: "12345678910"
            },
            movie: {
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2
            }
        });

        await movie.save();
        await rental.save();
    });

    const exec = () => {
        return request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId, movieId });
    };

    afterEach(async () => { 
        jest.setTimeout(200000);
        await server.close(); 
        await Movie.deleteMany({});
        await Rental.deleteMany({});
    });

    it("should return 200 if the request is valid", async () => {
        const { status } = await exec();

        expect(status).toBe(200);

        jest.setTimeout(200000);
    });

    it("should set the return date if the request is valid", async () => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);

        const diff = new Date() - rentalInDb.dateIn;

        expect(diff).toBeLessThan(10 * 10000);
    });

    it("should set the rental fee if the request is valid", async () => {
        rental.dateOut = moment().add(-7, "days").toDate();
        await rental.save();

        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.totalRental).toBe(2 * 7);
    });

    it("should increase the stock of the movie if the request is valid", async () => {
        await exec();
        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it("should return the rental object in the body of the response if the request is valid", async () => {
        const res = await exec();

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                "customer", "dateOut", "dateIn", "movie", "totalRental"
            ]));
    });

    it("should return 400 if customerId is not provided", async () => {
        customerId = "";

        const { status } = await exec();

        expect(status).toBe(400);
    });

    it("should return 400 if movieId is not provided", async () => {
        movieId = "";

        const { status } = await exec();

        expect(status).toBe(400);
    });

    it("should return 400 if rental already processed", async () => {
        rental.dateIn = new Date();
        await rental.save();

        const { status } = await exec();

        expect(status).toBe(400);
    });

    it("should return 401 if client is not logged in",  async () => {
        token = "";

        const { status } = await exec();

        expect(status).toBe(401);

        jest.setTimeout(100000);
    });

    it("should return 404 if no rental found for the customer/movie", async () => {
        await Rental.remove({});

        const { status } = await exec();

        expect(status).toBe(404);
    });
});