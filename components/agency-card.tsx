import { Card, CardContent } from "@/components/ui/card";
import { AgencyLocationDetails } from "@/types/agency";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function AgencyCard({ agencyDetails }: { agencyDetails: AgencyLocationDetails }) {
    return (
        <Card className="bg-highlight rounded-none lg:rounded-md shadow-md border-none lg:mb-6 fixed w-full bottom-0 z-40 left-0 lg:relative lg:w-auto lg:mb-0">
            <CardContent className="lg:p-4 p-2">
                <p className="hidden lg:block pl-2 text-md text-white/80">Marketed by</p>
                <div className="flex flex-row items-center lg:contents">
                    <h2 className="hidden lg:block text-xl text-white font-bold mb-2">{agencyDetails.name}</h2>
                    <div className="flex items-center flex-row lg:grid lg:grid-cols-3 gap-0 lg:pt-4">
                        <p className="justify-start hidden lg:block col-span-1 text-lg text-white/90 ml-2">{agencyDetails.address_line_1}, {agencyDetails.address_line_2 ? `${agencyDetails.address_line_2}, ` : ''}  {agencyDetails.city}, {agencyDetails.post_code}</p>
                        {agencyDetails.logo_url && (
                            <img src={agencyDetails.logo_url} alt={`${agencyDetails.name} Logo`} className="hidden sm:block h-12 md:h-16 lg:h-24 lg:object-fill lg:col-span-2" />
                        )}
                        <h2 className="hidden sm:block lg:hidden block text-md md:text-xl text-white font-bold text-center flex items-center justify-center">{agencyDetails.name}</h2>
                    </div>
                    <div className="flex flex-row gap-2 w-full sm:w-auto px-4 sm:px-2 lg:mt-8 sm:ml-auto sm:justify-end lg:justify-start">
                        <Button className="bg-yellow lg:mr-auto h-10 md:h-16 lg:h-20 w-1/2 sm:w-40 lg:w-1/2 hover:bg-yellowHover">
                            <Link href={`mailto:${agencyDetails.email}`} className="text-md md:text-lg text-foreground inline-flex items-center gap-1">
                                Email Agency
                                <Mail className="ml-2" />
                            </Link>
                        </Button>
                        <Button className="bg-yellow lg:ml-auto h-10 md:h-16 lg:h-20 w-1/2 sm:w-40 lg:w-1/2 hover:bg-yellowHover">
                            <Link href={`tel:${agencyDetails.phone_number}`} className="text-md md:text-lg text-foreground inline-flex items-center gap-1">
                                Call Agency
                                <Phone className="ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};