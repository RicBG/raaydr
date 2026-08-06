import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/data";

/* The one architectural rule: no metrics data in the code. The page renders
   from Supabase on every request, so a weekly update is a row written into
   the database — never a commit, a build or a deploy. */
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getDashboardData();
  return <Dashboard {...data} />;
}
