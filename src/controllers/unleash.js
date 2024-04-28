import { initialize as Unleash } from "unleash-client";

const unleash = Unleash({
  url: process.env.UNLEASH_API_URL,
  appName: process.env.ENVIRONMENT,
  instanceId: process.env.UNLEASH_INSTANCE_ID,
  refreshInterval: 1000 * 5,
});

export async function initialize() {
  return unleash;
}

/**
 * Check if a feature is enabled.
 *
 * @param {string} feature The feature to check.
 *
 * @returns {boolean} Whether the feature is enabled.
 */
export async function isEnabled(feature) {
  return unleash.isEnabled(feature);
}

export default { initialize, isEnabled };
