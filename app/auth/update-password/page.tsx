import Navbar from "@/components/navbar";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <div>
      <Navbar />
      <div className="bg-[url(/images/background.jpg)] bg-cover bg-top flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  );
}
