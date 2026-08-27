import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import OrnateDivider from "@/components/OrnateDivider";

export const metadata: Metadata = {
  title: "Enrol",
  description: "Inscribe yourself into the Athenaeum register.",
  robots: { index: false }
};

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/pricing";

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <div className="ornate-frame rounded border border-grain bg-oak p-10 sm:p-12">
        <header className="text-center">
          <p className="kicker">The Register of Scholars</p>
          <h1 className="font-heading mt-4 text-4xl">Take a seat</h1>
          <p className="mt-3 font-body italic text-faded">
            An account is free — the library asks its toll once.
          </p>
          <OrnateDivider className="mx-auto mt-7 w-48" />
        </header>
        <div className="mt-10">
          <AuthForm mode="register" nextPath={next} />
        </div>
      </div>
    </div>
  );
}
