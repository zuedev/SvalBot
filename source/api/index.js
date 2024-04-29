import express from "express";
import cors from "cors";
import log from "#library/log.js";

export default async () => {
  log("API is starting...");

  const app = express();

  app.use(cors({ origin: "*" }));

  app.get("/", (request, response) => {
    return response.send({
      uuid: uuid(),
      message: "Hello, World! :3",
    });
  });

  function uuid() {
    return "x".repeat(64).replace(/x/g, () => {
      return ((Math.random() * 16) | 0).toString(16);
    });
  }

  app.listen(3000, () => {
    log("Server is running on port 3000");
  });

  log("API has started!");
};
