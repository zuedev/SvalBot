/**
 * Converts a Discord snowflake to a timestamp
 *
 * @param {string} snowflake - The snowflake to convert
 *
 * @returns {Promise<number>} The timestamp
 */
export default async function snowflakeToTimestamp(snowflake) {
  return Number(BigInt(snowflake) >> 22n) + 1420070400000;
}
