import { GuestOnly } from "@/features/auth/components/GuestOnly";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <GuestOnly>
        <ResetPasswordForm />
      </GuestOnly>
    </main>
  );
}
