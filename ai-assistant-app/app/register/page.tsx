import { PageShell } from "@/components/PageShell";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <PageShell>
      <GuestOnly>
        <RegisterForm />
      </GuestOnly>
    </PageShell>
  );
}
