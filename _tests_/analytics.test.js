const request = require("supertest");
const app = require("../index");
const mongoose=require("mongoose")
const redis=require('../config/redis')
beforeAll(async () => {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Connect to Redis
  await redis.connect();
});

afterAll(async () => {
  // Close MongoDB connection
  await mongoose.connection.close();

  // Quit Redis connection
  await redis.quit();
});
describe("Analytics API", () => {
  test("GET /api/analytics/:alias - Should return analytics for a URL", async () => {
    const alias = "abc123";
    const response = await request(app).get(`/api/analytics/${alias}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("totalClicks");
    expect(response.body).toHaveProperty("uniqueClicks");
  });
});
