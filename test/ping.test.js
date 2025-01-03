import { assert } from "chai";
import { chaiRequest } from "./index.js";
import httpStatus from "http-status-codes";

/**
 * Test the /GET api/v1/ping route for a 200 response
 */
describe("/GET api/v1/ping", () => {
  it("should return 200", (done) => {
    chaiRequest.get("/api/v1/ping").end((err, res) => {
      assert.equal(res.status, httpStatus.OK);
      done();
    });
  });
});
