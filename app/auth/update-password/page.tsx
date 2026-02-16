import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <div className="bg-[url(/images/background.jpg)] bg-cover bg-center flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
