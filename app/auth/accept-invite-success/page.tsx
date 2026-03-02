import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AcceptInviteSuccess() {
    return (
        <div className="bg-[url(/images/background.jpg)] bg-cover bg-top min-h-screen w-full">
            <Navbar />
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-6">
                        <Card className="bg-white/90 border-none">
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Welcome to LightHouse!
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        You&apos;ve successfully signed up! Use the button below to finalise your account setup by providing some additional details and personalise your account. After this you can start using LightHouse!
                                    </p>

                                    <Button className="w-full text-md text-foreground bg-buttonColor hover:bg-buttonHover shadow-xl">
                                        <Link href="/onboarding/personal-details" className="w-full h-full">
                                            Complete Profile
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
