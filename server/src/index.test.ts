import request from "supertest";
import app from "./index";

describe("GET /ping", () => {
  it("should return pong", async () => {
    const res = await request(app).get("/ping");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("pong");
  });
});
