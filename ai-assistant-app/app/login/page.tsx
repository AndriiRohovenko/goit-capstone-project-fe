import { Suspense } from "react";
import { Loader } from "@/components/Loader";
import { PageShell } from "@/components/PageShell";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <PageShell>
      <GuestOnly>
        <Suspense fallback={<Loader label="Loading…" centered />}>
          <LoginForm />
        </Suspense>
      </GuestOnly>
    </PageShell>
  );
}
