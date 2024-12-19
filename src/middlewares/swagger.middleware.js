import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

const publicFolderPath = path.join(process.cwd(), "/public");

export const getSwaggerUi = () => {
  return [
    swaggerUi.serve,
    (req, res) => {
      const swaggerFileString = fs
        .readFileSync(publicFolderPath + "/swagger.json")
        .toString();
      const swaggerUiFile = fs
        .readFileSync(
          publicFolderPath + "/assets/styles/swagger-ui.min.css"
        )
        .toString();

      const swaggerHtml = swaggerUi.generateHTML(
        JSON.parse(swaggerFileString),
        {
          customCss: swaggerUiFile,
        }
      );

      return res.send(swaggerHtml);
    },
  ];
};

export const swaggerUiSetup = getSwaggerUi();
