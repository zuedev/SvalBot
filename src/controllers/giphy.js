/**
 * Search Giphy for GIFs matching a query
 *
 * @param {object} options - Options
 * @param {string} options.query - The search query
 * @param {boolean} [options.raw=false] - Return the raw Giphy response
 *
 * @returns {Promise<string[]|object>}
 */
export async function search({ query, raw = false }) {
  let result = await fetch(
    "https://api.giphy.com/v1/gifs/search?" +
      new URLSearchParams({
        api_key: process.env.GIPHY_API_KEY,
        q: query,
      })
  );

  result = await result.json();

  if (raw) return result;

  return result.data.map((gif) => gif.url);
}

/**
 * Get a random GIF from Giphy
 *
 * Results can be irrelevant to the query as it's completely random. If you want to search for a specific GIF, use {@link search} instead then pick a random GIF from the results.
 *
 * @param {object} options - Options
 * @param {string} options.query - The search query
 * @param {boolean} [options.raw=false] - Return the raw Giphy response
 *
 * @returns {Promise<string|object>}
 */
export async function random({ query, raw = false }) {
  let result = await fetch(
    "https://api.giphy.com/v1/gifs/random?" +
      new URLSearchParams({
        api_key: process.env.GIPHY_API_KEY,
        tag: query,
      })
  );

  result = await result.json();

  if (raw) return result;

  return result.data.url;
}

export default { search, random };
