const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const redis = require('../config/redis');

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
  }));
});

jest.mock("mongoose", () => {
  return {
    connect: jest.fn(),
    connection: {
      close: jest.fn(),
      readyState: 1,
    },
  };
});

jest.mock("../models/url", () => ({
  findOne: jest.fn(),
}));

beforeAll(async () => {
  // Mock connection to MongoDB and Redis
  await mongoose.connect(process.env.MONGO_URI);
  await redis.connect();  // Mocked connect function
});

afterAll(async () => {
  // Mock cleanup
  await mongoose.connection.close();
  await redis.quit();  // Mocked quit function
});

describe("Shorten API", () => {
  // Test for creating a short URL
  test("POST /api/shorten - Should create a short URL", async () => {
    const longUrl = "https://example.com/long-url";
    const response = await request(app)
      .post("/api/shorten")
      .send({ longUrl });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("shortUrl");
  });

  // Test for missing long URL
  test("POST /api/shorten - Should return error for missing longUrl", async () => {
    const response = await request(app).post("/api/shorten").send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Long URL is required");
  });

  // Test for redirecting to long URL
  test("GET /api/shorten/:alias - Should redirect to long URL", async () => {
    const alias = "abc123";
    const mockLongUrl = "https://example.com";
    // Mock the response for URL.findOne
    URL.findOne.mockResolvedValueOnce({ longUrl: mockLongUrl });

    const response = await request(app).get(`/api/shorten/${alias}`);
    expect(response.statusCode).toBe(302);
    expect(response.header.location).toBe(mockLongUrl);
  });
});
