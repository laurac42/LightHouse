import { LoginForm } from "@/components/auth/login-form";
import Navbar from "@/components/navbar";

export default function Page() {
  return (
    <div className="bg-[url(/images/background.jpg)] bg-cover bg-top min-h-screen w-full">
      <Navbar />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
