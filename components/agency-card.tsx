import { Card, CardContent } from "@/components/ui/card";
import { AgencyLocationDetails } from "@/types/agency";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function AgencyCard({ agencyDetails }: { agencyDetails: AgencyLocationDetails }) {
    return (
        <Card className="bg-highlight rounded-md shadow-md border-none mb-6">
            <CardContent className="p-4">
                <p className="pl-2 text-md text-white/80">Marketed by</p>
                <h2 className="text-xl text-white font-bold mb-2">{agencyDetails.name}</h2>
                <div className="grid grid-cols-3 gap-1 pt-4">
                    <p className="colspan-1 text-lg text-white/90">{agencyDetails.address_line_1}, {agencyDetails.address_line_2 ? `${agencyDetails.address_line_2}, ` : ''}  {agencyDetails.city}, {agencyDetails.post_code}</p>
                    {agencyDetails.logo_url && (
                        <img src={agencyDetails.logo_url} alt={`${agencyDetails.name} Logo`} className="h-24 object-fill col-span-2" />
                    )}
                </div>
                <div className="flex md:flex-row gap-2 mt-8">
                    <Button className="bg-yellow mr-auto h-20 w-1/2 hover:bg-yellowHover">
                        <Link href={`mailto:${agencyDetails.email}`} className="text-lg text-foreground inline-flex items-center gap-1">
                            Email Agency
                            <Mail className="ml-2" />
                        </Link>
                    </Button>
                    <Button className="bg-yellow ml-auto h-20 w-1/2 hover:bg-yellowHover">
                        <Link href={`tel:${agencyDetails.phone_number}`} className="text-lg text-foreground inline-flex items-center gap-1">
                            Call Agency
                            <Phone className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
};