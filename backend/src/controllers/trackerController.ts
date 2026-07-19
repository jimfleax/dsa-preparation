import { Request, Response } from "express";
import TrackedProblem from "../models/TrackedProblem.ts";
import {
  getLeetCodeTitle,
  getLeetCodeProblemInfo,
} from "../lib/leetcodeScraperUtil.ts";
import { extractTitleSlug } from "../lib/slugUtils.ts";
import mongoose from "mongoose";
import { calculateIsDue } from "../lib/dateUtils.ts";
import { AppError } from "../lib/AppError.ts";
import { catchAsync } from "../lib/catchAsync.ts";

const withDueFlag = (doc: any) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  if (!obj.lastAttemptedDate) return obj;
  return { ...obj, isDueToday: calculateIsDue(obj.lastAttemptedDate, obj.reviewDurationDays) };
};



/**
 * POST /api/problems/scrape-title
 * Public endpoint to scrape a LeetCode problem title (no auth required).
 * Used by frontend for real-time title fetching as user enters URL.
 * Body: { url: string }
 */
export const scrapeLeetCodeTitle = catchAsync(async (req: Request, res: Response) => {
        const { url } = req.body;
        const titleSlug = extractTitleSlug(url.trim());
        if (!titleSlug) {
              throw AppError.badRequest("Invalid LeetCode URL format.");
            }
        const info = await getLeetCodeProblemInfo(url.trim());
        if (!info) {
              throw AppError.notFound("Problem not found on LeetCode.");
            }
        res.json({
              success: true,
              title: info.title,
              difficulty: info.difficulty,
              titleSlug,
            });
        });

/**
 * GET /api/leetcode/calendar/:username
 * Public endpoint to fetch LeetCode user calendar.
 */
export const getLeetCodeCalendar = catchAsync(async (req: Request, res: Response) => {
        const { username } = req.params;
        const year = req.query.year
              ? parseInt(req.query.year as string, 10)
              : undefined;
        const graphqlQuery = {
              operationName: "userProfileCalendar",
              variables: {
                username,
                ...(year && { year }),
              },
              query: `query userProfileCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
          profile {
            ranking
          }
          userCalendar(year: $year) {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }`,
            };
        const response = await fetch("https://leetcode.com/graphql", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
              body: JSON.stringify(graphqlQuery),
            });
        if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
        const data = await response.json();
        if (data.errors) {
              console.error(
                "[LeetCode Scraper] GraphQL error (userProfileCalendar):",
                data.errors,
              );
              throw AppError.badRequest("LeetCode API returned an error");
            }
        const userCalendar = data.data?.matchedUser?.userCalendar || null;
        const ranking = data.data?.matchedUser?.profile?.ranking || null;
        if (userCalendar) {
              userCalendar.ranking = ranking;
            }
        res.json({ success: true, data: userCalendar });
        });

/**
 * GET /api/problems
 * Lists all tracked problems for the authenticated user, with optional search filtering and pagination.
 * Query params: ?search=<text>&sort=title|attempts|date&page=<number>&limit=<number>
 */
export const listProblems = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { search, sort } = req.query;
        const isLimitAll = req.query.limit === "all";
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = isLimitAll
              ? 0
              : Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const skip = isLimitAll ? 0 : (page - 1) * limit;
        const filter: Record<string, any> = { userId, notrack: { $ne: true } };
        if (search && typeof search === "string" && search.trim()) {
              filter.title = { $regex: search.trim(), $options: "i" };
            }
        let sortCriteria: Record<string, 1 | -1> = { lastAttemptedDate: -1 };
        if (sort === "title") sortCriteria = { title: 1 };
            else if (sort === "attempts") sortCriteria = { attemptCount: -1 };
            else if (sort === "date") sortCriteria = { lastAttemptedDate: -1 };
        let query = TrackedProblem.find(filter).sort(sortCriteria);
        if (!isLimitAll) {
              query = query.skip(skip).limit(limit);
            }
        const [problems, totalCount] = await Promise.all([
              query.lean(),
              TrackedProblem.countDocuments(filter),
            ]);
        const processedProblems = problems.map((p) => {
              const { notes, ...rest } = p as any;
              return {
                ...rest,
                url: p.url || `https://leetcode.com/problems/${p.titleSlug}/`,
                hasNotes: !!notes,
                isDueToday: calculateIsDue(p.lastAttemptedDate, p.reviewDurationDays),
              };
            });
        res.json({
              success: true,
              problems: processedProblems,
              count: processedProblems.length,
              pagination: isLimitAll
                ? null
                : {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit),
                  },
            });
        });

/**
 * POST /api/problems
 * Adds a new solved problem to the tracker for the authenticated user.
 * Body: { url: string }
 * Fetches the exact title from LeetCode using GraphQL API.
 * Sets attemptCount=1 and lastAttemptedDate=now.
 */
export const addProblem = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { url, reviewDurationDays } = req.body;
        const titleSlug = extractTitleSlug(url.trim());
        if (!titleSlug) {
              return res.status(400).json({
                success: false,
                error: "Could not parse a valid problem slug from the URL.",
              });
            }
        const existing = await TrackedProblem.findOne({ userId, titleSlug });
        if (existing) {
              return res.status(409).json({
                success: false,
                error: "This problem is already being tracked.",
                problem: existing,
              });
            }
        let title: string;
        let difficulty: string | undefined;
        try {
              const fetchedInfo = await getLeetCodeProblemInfo(url.trim());
              if (!fetchedInfo) {
                return res.status(400).json({
                  success: false,
                  error:
                    "Could not fetch problem details from LeetCode. Please verify the URL.",
                });
              }
              title = fetchedInfo.title;
              difficulty = fetchedInfo.difficulty;
            } catch (scraperError: any) {
              console.error(
                "[addProblem] Error fetching title from LeetCode:",
                scraperError.message,
              );
              return res.status(502).json({
                success: false,
                error:
                  "Failed to fetch problem details from LeetCode. Please try again later.",
              });
            }
        const problem = await TrackedProblem.create({
              userId,
              titleSlug,
              title,
              url: url.trim(),
              difficulty: difficulty as "Easy" | "Medium" | "Hard" | undefined,
              attemptCount: 1,
              lastAttemptedDate: new Date(),
              ...(reviewDurationDays ? { reviewDurationDays } : {}),
            });
        res.status(201).json({ success: true, problem: withDueFlag(problem) });
        });

/**
 * PATCH /api/problems/:id/revisit
 * Records a revisit: increments attemptCount and sets lastAttemptedDate to now.
 * Uses compound query {_id, userId} to prevent IDOR.
 */
export const revisitProblem = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
              throw AppError.badRequest("Invalid ID format.");
            }
        const problem = await TrackedProblem.findOne({ _id: id, userId });
        if (!problem) {
              throw AppError.notFound("Problem not found.");
            }
        const { timestamp, reviewDurationDays } = req.body || {};
        problem.attemptCount += 1;
        if (timestamp) {
              problem.lastAttemptedDate = new Date(Number(timestamp) * 1000);
            } else {
              problem.lastAttemptedDate = new Date();
            }
        if (reviewDurationDays !== undefined) {
              if (reviewDurationDays === null) {
                problem.reviewDurationDays = undefined; // Unset
              } else {
                problem.reviewDurationDays = reviewDurationDays;
              }
            }
        await problem.save();
        res.json({ success: true, problem: withDueFlag(problem) });
        });

/**
 * PATCH /api/problems/slug/:titleSlug/revisit
 * Records a revisit by titleSlug instead of _id.
 */
export const revisitProblemBySlug = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { titleSlug } = req.params;
        if (!titleSlug) {
              throw AppError.badRequest("titleSlug is required.");
            }
        const problem = await TrackedProblem.findOne({ titleSlug, userId });
        if (!problem) {
              throw AppError.notFound("Problem not found.");
            }
        const { timestamp, reviewDurationDays } = req.body || {};
        problem.attemptCount += 1;
        if (timestamp) {
              problem.lastAttemptedDate = new Date(Number(timestamp) * 1000);
            } else {
              problem.lastAttemptedDate = new Date();
            }
        if (reviewDurationDays !== undefined) {
              if (reviewDurationDays === null) {
                problem.reviewDurationDays = undefined;
              } else {
                problem.reviewDurationDays = reviewDurationDays;
              }
            }
        await problem.save();
        res.json({ success: true, problem: withDueFlag(problem) });
        });

/**
 * PUT /api/problems/:id
 * Updates a problem (url, attempts). Re-fetches LeetCode title/difficulty if URL changes.
 */
export const updateProblem = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
              throw AppError.badRequest("Invalid ID format.");
            }
        const { url, attemptCount, reviewDurationDays, notes } = req.body;
        const problem = await TrackedProblem.findOne({ _id: id, userId });
        if (!problem) {
              throw AppError.notFound("Problem not found.");
            }
        if (attemptCount !== undefined) {
              problem.attemptCount = attemptCount;
            }
        if (reviewDurationDays !== undefined) {
              if (reviewDurationDays === null) {
                problem.reviewDurationDays = undefined;
              } else {
                problem.reviewDurationDays = reviewDurationDays;
              }
            }
        if (notes !== undefined) {
              if (notes === null) {
                problem.notes = undefined;
              } else {
                problem.notes = notes;
              }
            }
        if (url && typeof url === "string" && url.trim() !== problem.url) {
              const newUrl = url.trim();
              const titleSlug = extractTitleSlug(newUrl);

              if (!titleSlug) {
                return res.status(400).json({
                  success: false,
                  error: "Could not parse a valid problem slug from the new URL.",
                });
              }

              // Check for conflicts
              const existing = await TrackedProblem.findOne({
                userId,
                titleSlug,
                _id: { $ne: id },
              });
              if (existing) {
                return res.status(409).json({
                  success: false,
                  error: "You are already tracking this problem in another entry.",
                });
              }

              // Fetch new title and difficulty
              try {
                const fetchedInfo = await getLeetCodeProblemInfo(newUrl);
                if (!fetchedInfo) {
                  return res.status(400).json({
                    success: false,
                    error:
                      "Could not fetch problem details from LeetCode. Please verify the new URL.",
                  });
                }
                problem.url = newUrl;
                problem.titleSlug = titleSlug;
                problem.title = fetchedInfo.title;
                if (fetchedInfo.difficulty)
                  problem.difficulty = fetchedInfo.difficulty as any;
              } catch (scraperError: any) {
                console.error(
                  "[updateProblem] Error fetching title from LeetCode:",
                  scraperError.message,
                );
                return res.status(502).json({
                  success: false,
                  error:
                    "Failed to fetch problem details from LeetCode. Please try again later.",
                });
              }
            }
        await problem.save();
        res.json({ success: true, problem: withDueFlag(problem) });
        });

/**
 * DELETE /api/problems/:id
 * Removes a problem from the tracker. Scoped to authenticated user only.
 */
export const deleteProblem = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
              throw AppError.badRequest("Invalid ID format.");
            }
        const problem = await TrackedProblem.findOneAndDelete({ _id: id, userId });
        if (!problem) {
              throw AppError.notFound("Problem not found.");
            }
        res.json({ success: true, message: "Problem removed from tracker." });
        });

/**
 * GET /api/problems/untracked
 * Lists all problems for the authenticated user that have notrack: true.
 */
export const listUntrackedProblems = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const problems = await TrackedProblem.find({ userId, notrack: true })
              .sort({ createdAt: -1 })
              .lean();
        const problemsWithFlag = problems.map((p: any) => withDueFlag(p));
        res.json({ success: true, problems: problemsWithFlag, count: problemsWithFlag.length });
        });

/**
 * PATCH /api/problems/:id/toggle-track
 * Toggles the notrack flag for a given problem.
 */
export const toggleTrackProblem = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
              throw AppError.badRequest("Invalid ID format.");
            }
        const problem = await TrackedProblem.findOne({ _id: id, userId });
        if (!problem) {
              throw AppError.notFound("Problem not found.");
            }
        problem.notrack = !problem.notrack;
        await problem.save();
        res.json({ success: true, problem: withDueFlag(problem) });
        });

/**
 * GET /api/problems/solved-slugs
 * Returns an array of slugs for tracked problems. Used for fast lookup.
 */
export const getSolvedSlugs = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const problems = await TrackedProblem.find({
              userId,
              notrack: { $ne: true },
            })
              .select("titleSlug -_id")
              .lean();
        const slugs = problems.map((p: any) => p.titleSlug).filter(Boolean);
        res.json({ success: true, slugs, count: slugs.length });
        });

/**
 * GET /api/problems/due
 * Returns problems due for review today or earlier.
 */
export const getDueProblems = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const problems = await TrackedProblem.find({
              userId,
              notrack: { $ne: true },
              reviewDurationDays: { $exists: true, $ne: null },
            })
              .select("titleSlug title difficulty lastAttemptedDate reviewDurationDays attemptCount url")
              .lean();
        const dueProblems = problems.filter((p: any) => calculateIsDue(p.lastAttemptedDate, p.reviewDurationDays));
        const dueProblemsWithFlag = dueProblems.map((p: any) => withDueFlag(p));
        res.json({ success: true, problems: dueProblemsWithFlag, count: dueProblemsWithFlag.length });
        });

/**
 * GET /api/problems/slim
 * Returns a slimmed down version of all tracked problems, used for search.
 */
export const getSlimProblems = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const problems = await TrackedProblem.find({
              userId,
              notrack: { $ne: true },
            })
              .select("titleSlug title difficulty attemptCount")
              .lean();
        const problemsWithFlag = problems.map((p: any) => withDueFlag(p));
        res.json({ success: true, problems: problemsWithFlag, count: problemsWithFlag.length });
        });

/**
 * GET /api/tracker/metrics
 * Returns global metrics for the user's tracked problems (total count, difficulty distribution, new today).
 */
export const getTrackerMetrics = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const problems = await TrackedProblem.find({
              userId,
              notrack: { $ne: true },
            })
              .select("difficulty lastAttemptedDate attemptCount")
              .lean();
        let easy = 0,
              medium = 0,
              hard = 0,
              unrated = 0;
        let newToday = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        problems.forEach((p: any) => {
              if (p.difficulty === "Easy") easy++;
              else if (p.difficulty === "Medium") medium++;
              else if (p.difficulty === "Hard") hard++;
              else unrated++;
              
              if (p.lastAttemptedDate && p.attemptCount === 1) {
                const attemptedDate = new Date(p.lastAttemptedDate);
                if (attemptedDate >= today) {
                  newToday++;
                }
              }
            });
        res.json({
              success: true,
              metrics: {
                totalSolved: problems.length,
                newToday,
                difficulty: {
                  Easy: easy,
                  Medium: medium,
                  Hard: hard,
                  Unrated: unrated,
                },
              },
            });
        });

/**
 * GET /api/tracker/:id
 * Returns a single tracked problem with full data (including notes).
 */
export const getProblemById = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
              throw AppError.unauthorized("Unauthorized");
            }
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
              throw AppError.badRequest("Invalid ID format.");
            }
        const problem = await TrackedProblem.findOne({ _id: id, userId }).lean();
        if (!problem) {
              throw AppError.notFound("Problem not found.");
            }
        res.json({ success: true, problem: withDueFlag(problem) });
        });
