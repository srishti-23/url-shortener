describe("Analytics API", () => {
    test("GET /api/analytics/:alias - Should return analytics for a URL", async () => {
      const alias = "abc123";
      const response = await request(app).get(`/api/analytics/${alias}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("totalClicks");
      expect(response.body).toHaveProperty("uniqueClicks");
    });
  });
  