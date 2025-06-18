import request from "supertest";
import app from "./index";


describe("GET /ping", () => {
  it("should return pong", async () => {
    const res = await request(app).get("/ping");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("pong");
  });
});

describe("GET /add", () => {
  it("adds two numbers", async () => {
    const res = await request(app).get("/add?a=2&b=3");
    expect(res.body.result).toBe(5);
  });
});

describe("GET /divide", () => {
  it("divides two numbers", async () => {
    const res = await request(app).get("/divide?a=10&b=2");
    expect(res.body.result).toBe(5);
  });

  it("handles division by zero", async () => {
    const res = await request(app).get("/divide?a=10&b=0");
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("Division by zero");
  });
});