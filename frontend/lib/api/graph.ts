import { GraphResponse } from "@/components/game/types";

const GRAPH_API_PATH = "/api/graph";

function getBackendBaseUrl(): string {
  if (!process.env.BACKEND_URL) {
    throw new Error("BACKEND_URL is not configured");
  }

  return process.env.BACKEND_URL;
}

export function buildGraphApiPath(seed?: string): string {
  return seed
    ? `${GRAPH_API_PATH}?seed=${encodeURIComponent(seed)}`
    : GRAPH_API_PATH;
}

export function buildBackendGraphUrl(seed?: string): string {
  return `${getBackendBaseUrl()}${buildGraphApiPath(seed)}`;
}

async function parseGraphResponse(res: Response, errorMessage: string): Promise<GraphResponse> {
  if (!res.ok) {
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function fetchGraphFromBackend(seed?: string): Promise<GraphResponse> {
  const res = await fetch(buildBackendGraphUrl(seed), { cache: "no-store" });
  return parseGraphResponse(res, "Failed to fetch graph from backend");
}

export async function fetchGraphFromRoute(seed?: string): Promise<GraphResponse> {
  const res = await fetch(buildGraphApiPath(seed), { cache: "no-store" });
  return parseGraphResponse(res, "Failed to fetch graph");
}