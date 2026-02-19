import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <Navbar />
      <div className="bg-[url(/images/background.jpg)] bg-cover bg-top flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card className="bg-white/90 border-none">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Thank you for signing up!
                </CardTitle>
                <CardDescription>Check your email to confirm</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve successfully signed up. Please check your email to
                  confirm your account before signing in. If you do not receive an email within a few minutes, please check your spam folder.
                </p>
                <p className="text-sm text-muted-foreground pt-4">
                  Not receive an email? You may already have an account.
                </p>
                <p className="text-sm text-highlight">
                  You can &nbsp;
                  <Link href="/auth/login" className="underline underline-offset-4">
                    sign in 
                  </Link>
                   &nbsp; to your account, or &nbsp;
                  <Link href="/auth/forgot-password" className="underline underline-offset-4">
                    reset your password.
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
