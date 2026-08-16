"use client";

import * as React from "react";
import type { ReactNode } from "react";

/**
 * Wraps the routed content so navigations animate through the browser's own
 * View Transitions API.
 *
 * Three things are load bearing here.
 *
 * The `experimental.viewTransition` flag in next.config.ts is necessary but
 * not sufficient. With the flag alone and no component in the tree, a route
 * change triggers nothing at all: measured, document.startViewTransition was
 * called zero times on a navigation.
 *
 * It has to be a client component, because the transition activates from
 * React's navigation Transition, which only exists on the client.
 *
 * And the component is read off the React namespace rather than imported by
 * name. App Router resolves `react` to the copy Next vendors, which does
 * export ViewTransition, but the installed @types/react does not declare it,
 * so a named import fails to typecheck against a symbol that is really there
 * at runtime. Reading it off the namespace with a guard keeps the types honest
 * and means that if the export ever moves, the site renders its children
 * unanimated instead of crashing.
 *
 * The animation itself is CSS on ::view-transition-old/new(root) in
 * globals.css, so there is no animation library and no per navigation work of
 * ours. Browsers without the API navigate exactly as they did before.
 */
type Wrapper = React.ComponentType<{ children: ReactNode }>;

const ViewTransition = (React as unknown as { ViewTransition?: Wrapper })
  .ViewTransition;

export default function RouteTransition({ children }: { children: ReactNode }) {
  if (!ViewTransition) return <>{children}</>;
  return <ViewTransition>{children}</ViewTransition>;
}
