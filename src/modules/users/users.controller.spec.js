import request from "supertest";
import httpStatus from "http-status-codes";
import app from "#src/app";

describe("Create user route", () => {
  describe("validation error", () => {
    it("should return a 400", async () => {
      const { statusCode } = await request(app)
        .post("/api/v1/users/create-user")
        .send({
          name: "user",
        });

      expect(statusCode).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
