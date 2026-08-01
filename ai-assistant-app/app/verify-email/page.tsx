import { Suspense } from "react";
import { VerifyEmail } from "@/features/auth/components/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Suspense
        fallback={
          <p className="text-sm text-zinc-600">Verifying your email…</p>
        }
      >
        <VerifyEmail />
      </Suspense>
    </main>
  );
}
