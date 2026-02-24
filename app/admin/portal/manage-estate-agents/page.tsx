'use client';

import Navbar from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { MailIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AdminPortalMenu from "@/components/admin-portal-menu";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

export default function ManageEstateAgentsPage() {
  return (
    <div className="bg-background w-full min-h-svh">
      <Navbar />
      <div className="w-full p-6 md:p-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <AdminPortalMenu />
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Manage Estate Agents</CardTitle>
              <CardDescription>
                Here you can create and manage estate agent profiles. Just enter the email address, select the company and click "Add Estate Agent" to add a new estate agent to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="md:grid md:grid-cols-2 md:gap-x-4">
                  <div className="flex flex-col gap-2">
                    <Field className="pb-8">
                      <FieldLabel htmlFor="estate-agent-email">Estate Agent Email</FieldLabel>
                      <InputGroup className="border border-foreground flex">
                        <InputGroupInput type="email" placeholder="agent@company.com" />
                        <InputGroupAddon>
                          <MailIcon />
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>Email address of the person you want to add as an estate agent.</FieldDescription>
                    </Field>
                  </div>
                  <div className="flex flex-col">
                    <Field>
                      <FieldLabel>Select Estate Agent Company</FieldLabel>
                    
                    <Select>
                      <SelectTrigger className="border border-foreground">
                        <SelectValue placeholder="Select Company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="1">Company 1</SelectItem>
                          <SelectItem value="2">Company 2</SelectItem>
                          <SelectItem value="3">Company 3</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                      <FieldDescription className="pt-0 mt-0">Select the company the estate agent works for.</FieldDescription>
                    </Field>
                    {/* <div className="w-3/4 flex justify-end mt-4"> */}
                    <Button className="bg-buttonColor hover:bg-buttonHover text-foreground font-bold text-md h-10 w-1/2 mt-4 ml-auto">
                      Add Estate Agent
                    </Button>
                    {/* </div> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
