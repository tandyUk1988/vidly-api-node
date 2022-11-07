const mongoose = require("mongoose");
const request = require("supertest");
const {Genre} = require("../../models/genre");
const {User} = require("../../models/user");

let app;

describe("/api/genres", () => {
    beforeEach(() => { server = require("../../server"); });
    afterEach(async () => { 
        await server.close(); 
        await Genre.deleteMany({});
    });

    describe("GET /", () => {
        it("should return all genres", async () => {
            await Genre.collection.insertMany([
                { name: "genre1" },
                { name: "genre2" },
            ]);
            const res = await request(server).get("/api/genres");
            const {status, body} = res;
    
            expect(status).toBe(200);
            expect(body.length).toBe(2);
            expect(body.some(g => g.name === "genre1")).toBeTruthy();
            expect(body.some(g => g.name === "genre2")).toBeTruthy();
        })
    });

    describe("GET /:id", () => {
        it("should return a genre if valid ID is passed", async () => {
            const genre = new Genre({ name: "genre1" });
            await genre.save();

            const {body, status} = await request(server).get("/api/genres/" + genre._id);
            expect(status).toBe(200);
            expect(body).toHaveProperty("name");
        });

        it("should return 404 if invalid ID is passed", async () => {
            const {status} = await request(server).get("/api/genres/1");

            expect(status).toBe(404);
        });
        it("should return 404 if no genre with the given ID exists", async () => {
            const id = mongoose.Types.ObjectId().toHexString();
            const {status} = await request(server).get("/api/genres/" + id);

            expect(status).toBe(404);
        });
    });

    describe("POST /", () => {
        let name;
        let token;
       
        const exec = async () => {
            return await request(server)
            .post("/api/genres")
            .set("x-auth-token", token)
            .send({ name });
        };

        beforeEach(() => {
            name = "genre1";
            token = new User().generateAuthToken();
        })

        it("should return a 401 if client is not logged in", async () => {
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("should return a 400 if genre is less than 5 characters", async () => {
            name = "1234";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return a 400 if genre is more than 50 characters", async () => {
            name = new Array(52).join("a");

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the genre if it is valid", async () => {
            await exec();

            const genre = await Genre.find({ name: "genre1" });

            expect(genre).not.toBeNull();
        });

        it("should return the genre if it is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "genre1");
        });
    });

    describe("PUT /:id", () => {
        let genre;
        let id;
        let newName;
        let token;

        const exec = async () => {
            return await request(server)
                .put("/api/genres/" + id)
                .set("x-auth-token", token)
                .send({ name: newName })
        };

        beforeEach( async () => {
            genre = new Genre({ name: "genre1" });
            await genre.save();

            id = genre._id;
            newName = "altered genre";
            token = new User().generateAuthToken();
        });

        it("should update the genre if input is valid", async () => {
            await exec();

            const updatedGenre = await Genre.findById(genre._id);
      
            expect(updatedGenre.name).toBe(newName);
        });

        it("should return the update genre if it is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            newName = "1234";

            const {status} = await exec();

            expect(status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            newName = new Array(52).join("a");

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

        it('should return 404 if genre with the given ID was not found', async () => {
            id = mongoose.Types.ObjectId();

            const {status} = await exec();
            
            expect(status).toBe(404);
        });
    });    

    describe("DELETE /:id", () => {
        let genre;
        let token;
        let id;
       
        const exec = async () => {
            return await request(server)
            .delete(`/api/genres/${id}` )
            .set("x-auth-token", token)
            .send();
        };

        beforeEach( async () => {
            genre = new Genre({ name: 'genre1' });
            await genre.save();
            
            id = genre._id; 
            token = new User({ isAdmin: true }).generateAuthToken();     
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

        it("should return a 404 if the genre ID doesn't exist", async () => {
            id = mongoose.Types.ObjectId();

            const {status} = await exec();

            expect(status).toBe(404);
        });

        it("should delete the input if ID is valid", async () => {
            await exec();

            const genreInDb = await Genre.findById(id);

            expect(genreInDb).toBeNull();
        });

        it("should return the removed genre", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id", genre._id.toHexString() );
            expect(res.body).toHaveProperty("name", genre.name);
        })
    });
})