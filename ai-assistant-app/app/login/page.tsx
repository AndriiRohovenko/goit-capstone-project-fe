import { Suspense } from "react";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <GuestOnly>
        <Suspense
          fallback={<p className="text-sm text-zinc-600">Loading…</p>}
        >
          <LoginForm />
        </Suspense>
      </GuestOnly>
    </main>
  );
}
