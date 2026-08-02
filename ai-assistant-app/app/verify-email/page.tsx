import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { VerifyEmail } from "@/features/auth/components/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <PageShell>
      <Suspense fallback={<p>Verifying your email…</p>}>
        <VerifyEmail />
      </Suspense>
    </PageShell>
  );
}
