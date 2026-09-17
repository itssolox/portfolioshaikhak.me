import { Router, type IRouter } from "express";
import { GetLeetcodeStatsResponse, GetGithubStatsResponse } from "@workspace/api-zod";
import { getLeetcodeStats, getGithubStats } from "../lib/stats";

const router: IRouter = Router();

router.get("/stats/leetcode", async (req, res): Promise<void> => {
  try {
    const stats = await getLeetcodeStats();
    res.set("cache-control", "public, max-age=300");
    res.json(GetLeetcodeStatsResponse.parse(stats));
  } catch (err) {
    req.log.error({ err }, "LeetCode stats unavailable");
    res.status(502).json({ error: "LeetCode stats unavailable" });
  }
});

router.get("/stats/github", async (req, res): Promise<void> => {
  try {
    const stats = await getGithubStats();
    res.set("cache-control", "public, max-age=300");
    res.json(GetGithubStatsResponse.parse(stats));
  } catch (err) {
    req.log.error({ err }, "GitHub stats unavailable");
    res.status(502).json({ error: "GitHub stats unavailable" });
  }
});

export default router;
