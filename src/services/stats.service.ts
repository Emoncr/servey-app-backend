import SurveyResponse from "../models/Response.model";
import { ChartPoint, StatsResult } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_DAYS = 14;

const startOfUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

const formatUtcDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

const groupCounts = async (
  field: string,
  match?: Record<string, unknown>
): Promise<ChartPoint[]> => {
  const rows = await SurveyResponse.aggregate<{ _id: string; count: number }>([
    ...(match ? [{ $match: match }] : []),
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]).exec();

  return rows.map((row) => ({ name: row._id, count: row.count }));
};

export const getStats = async (): Promise<StatsResult> => {
  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const trendStart = new Date(todayStart.getTime() - (TREND_DAYS - 1) * DAY_MS);

  const [
    totalResponses,
    averageAgeResult,
    responsesToday,
    topUniversityResult,
    educationLevel,
    gender,
    skillLevel,
    interestedFields,
    trendRows,
  ] = await Promise.all([
    SurveyResponse.countDocuments(),
    SurveyResponse.aggregate<{ averageAge: number }>([
      {
        $group: {
          _id: null,
          averageAge: { $avg: "$age" },
        },
      },
    ]).exec(),
    SurveyResponse.countDocuments({ createdAt: { $gte: todayStart } }),
    SurveyResponse.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$university", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 },
    ]).exec(),
    groupCounts("educationLevel"),
    groupCounts("gender"),
    groupCounts("currentStatus"),
    groupCounts("occupation", {
      occupation: { $exists: true, $nin: ["", null] },
    }),
    SurveyResponse.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: trendStart } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec(),
  ]);

  const trendMap = new Map(trendRows.map((row) => [row._id, row.count]));
  const submissionsPerDay = Array.from({ length: TREND_DAYS }, (_, index) => {
    const date = new Date(trendStart.getTime() + index * DAY_MS);
    const key = formatUtcDate(date);
    return { date: key, count: trendMap.get(key) ?? 0 };
  });

  const averageAge =
    averageAgeResult.length > 0
      ? Math.round(averageAgeResult[0].averageAge * 10) / 10
      : 0;

  return {
    totalResponses,
    averageAge,
    responsesToday,
    topUniversity: topUniversityResult[0]?._id ?? "N/A",
    educationLevel,
    gender,
    skillLevel,
    interestedFields,
    submissionsPerDay,
  };
};
