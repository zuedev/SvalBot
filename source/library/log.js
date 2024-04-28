import { insert } from "../controllers/mongodb.js";

/**
 * Logs an object to the console and database.
 * @param {object} object - The object to log.
 */
export default async (object) => {
  if (typeof object === "string") object = { message: object };

  console.log(object);

  try {
    await insert("logs", object);
  } catch (error) {
    console.error(error);
  }
};
