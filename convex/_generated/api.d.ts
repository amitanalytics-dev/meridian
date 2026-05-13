/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminOps from "../adminOps.js";
import type * as adminOpsActions from "../adminOpsActions.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as readiness from "../readiness.js";
import type * as scheduledBlogs from "../scheduledBlogs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminOps: typeof adminOps;
  adminOpsActions: typeof adminOpsActions;
  chat: typeof chat;
  crons: typeof crons;
  readiness: typeof readiness;
  scheduledBlogs: typeof scheduledBlogs;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
