import { insert } from "#controllers/mongodb.js";

/**
 * Logs an object to the console and database.
 * @param {object} object - The object to log.
 * @param {string} [namespace="generic-logs"] - The namespace to log the object under.
 * @returns {Promise<void>} A Promise.
 */
export default async (object, namespace = "logs.catchall") => {
  if (typeof object === "string") object = { message: object };

  console.log(object);

  try {
    await insert(namespace, object);
  } catch (error) {
    console.error(error);
  }
};
