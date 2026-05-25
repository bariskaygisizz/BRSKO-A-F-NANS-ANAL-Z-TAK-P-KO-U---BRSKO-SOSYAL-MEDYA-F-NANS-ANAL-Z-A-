import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav user={session.user as any} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
