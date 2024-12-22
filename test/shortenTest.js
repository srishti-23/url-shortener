const request = require("supertest");
const app = require("../app"); // Assuming your Express app is exported from app.js
const ShortUrl = require("../models/url");

// Mock MongoDB
const mongoose = require("mongoose");
jest.mock("mongoose");

describe("Shorten API", () => {
  afterAll(() => {
    mongoose.connection.close();
  });

  test("POST /api/shorten - Should create a short URL", async () => {
    const longUrl = "https://example.com/long-url";
    const response = await request(app)
      .post("/api/shorten")
      .send({ longUrl });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("shortUrl");
  });

  test("POST /api/shorten - Should return error for missing longUrl", async () => {
    const response = await request(app).post("/api/shorten").send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Long URL is required");
  });

  test("GET /api/shorten/:alias - Should redirect to long URL", async () => {
    const alias = "abc123";
    jest.spyOn(ShortUrl, "findOne").mockResolvedValueOnce({ longUrl: "https://example.com" });

    const response = await request(app).get(`/api/shorten/${alias}`);
    expect(response.statusCode).toBe(302);
  });
});
