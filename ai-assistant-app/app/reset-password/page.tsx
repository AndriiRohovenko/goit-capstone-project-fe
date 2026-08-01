import { PageShell } from "@/components/PageShell";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <PageShell>
      <GuestOnly>
        <ResetPasswordForm />
      </GuestOnly>
    </PageShell>
  );
}
