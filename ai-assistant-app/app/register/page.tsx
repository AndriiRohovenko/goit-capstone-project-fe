import { GuestOnly } from "@/features/auth/components/GuestOnly";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <GuestOnly>
        <RegisterForm />
      </GuestOnly>
    </main>
  );
}
