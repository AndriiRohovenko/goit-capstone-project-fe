import { Suspense } from "react";
import { Loader } from "@/components/Loader";
import { PageShell } from "@/components/PageShell";
import { VerifyEmail } from "@/features/auth/components/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <PageShell>
      <Suspense fallback={<Loader label="Verifying your email…" centered />}>
        <VerifyEmail />
      </Suspense>
    </PageShell>
  );
}
