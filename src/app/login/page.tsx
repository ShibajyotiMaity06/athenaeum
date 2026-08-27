import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import OrnateDivider from "@/components/OrnateDivider";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Enter the Athenaeum reading room.",
  robots: { index: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/library";

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <div className="ornate-frame rounded border border-grain bg-oak p-10 sm:p-12">
        <header className="text-center">
          <p className="kicker">Readers&apos; Entrance</p>
          <h1 className="font-heading mt-4 text-4xl">Welcome back</h1>
          <OrnateDivider className="mx-auto mt-7 w-48" />
        </header>
        <div className="mt-10">
          <AuthForm mode="login" nextPath={next} />
        </div>
      </div>
    </div>
  );
}
