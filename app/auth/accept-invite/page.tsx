import { SignUpForm } from "@/components/sign-up-form";
import { AcceptInviteForm } from "@/components/accept-invite-form";

import Navbar from "@/components/navbar";

export default function Page() {
  return (
    <div className="bg-[url(/images/background.jpg)] bg-cover bg-top min-h-screen w-full">
      <Navbar />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <AcceptInviteForm />
        </div>
      </div>
    </div>
  );
}