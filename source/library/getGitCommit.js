import { execSync } from "child_process";

/**
 * Get the current Git commit data.
 * @returns {{ hash: string, message: string }} The Git commit data.
 */
export default () => {
  return {
    hash: {
      short: execSync("git rev-parse --short HEAD").toString().trim(),
      long: execSync("git rev-parse HEAD").toString().trim(),
    },
    message: execSync("git log -1 --pretty=%B").toString().trim(),
  };
};
