import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Run at 08:00 UTC every day
crons.cron(
  "send nurture emails",
  "0 8 * * *",
  internal.adminOpsActions.sendDueNurtureEmails,
  {},
)

export default crons
