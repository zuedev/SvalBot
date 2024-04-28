import { CronJob } from "cron";

/**
 * Wrapper function to register cron jobs all at once.
 *
 * @param {Array} jobs - An array of cron jobs
 *
 * @returns {Promise<void>}
 */
export default async function registerCronJobs(jobs) {
  const jobCollection = [];

  jobs.forEach((job) => {
    // create cron job
    const x = new CronJob(
      job.cronTime,
      job.onTick,
      job.onComplete || null,
      job.start || false,
      job.timeZone || "UTC",
      job.context || null,
      job.runOnInit || false
    );

    // push to collection
    jobCollection.push(x);
  });

  // start all jobs
  jobCollection.forEach((job) => job.start());
}
