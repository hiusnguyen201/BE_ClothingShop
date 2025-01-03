import * as chaiModule from "chai";
import chaiHttp from "chai-http";
import app from "#src/app";

const chai = chaiModule.use(chaiHttp);

export const chaiRequest = chai.request.execute(app);
