import { ForgotPasswordForm } from "@/components/forgot-password-form";
import Navbar from "@/components/navbar";

export default function Page() {
  return (
    <div>
      <Navbar />
      <div className="bg-[url(/images/background.jpg)] bg-cover bg-top flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
