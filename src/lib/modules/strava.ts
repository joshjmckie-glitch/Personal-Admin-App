import type { FitnessActivityType } from "@/lib/types/database";

export const STRAVA_SCOPE = "activity:read";

/** Strava's activity types are far more granular than this app's — collapse them onto the existing 5. */
const STRAVA_TYPE_MAP: Record<string, FitnessActivityType> = {
  Run: "running",
  TrailRun: "running",
  VirtualRun: "running",
  Ride: "cycling",
  VirtualRide: "cycling",
  EBikeRide: "cycling",
  MountainBikeRide: "cycling",
  GravelRide: "cycling",
  WeightTraining: "strength",
  Workout: "strength",
  Crossfit: "strength",
  HighIntensityIntervalTraining: "strength",
};

export function mapStravaActivityType(stravaType: string): FitnessActivityType {
  return STRAVA_TYPE_MAP[stravaType] ?? "other";
}

export function stravaAuthorizeUrl(clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: STRAVA_SCOPE,
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}
