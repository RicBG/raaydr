// The homepage at /ig, so the visit is counted under its own path. See lib/trackingPaths.ts.
import { trackingPathMetadata } from "@/lib/trackingPaths";

export { default } from "../page";
export const metadata = trackingPathMetadata;
