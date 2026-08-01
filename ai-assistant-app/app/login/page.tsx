import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <PageShell>
      <GuestOnly>
        <Suspense fallback={<p>Loading…</p>}>
          <LoginForm />
        </Suspense>
      </GuestOnly>
    </PageShell>
  );
}
