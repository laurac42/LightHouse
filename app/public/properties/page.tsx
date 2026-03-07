"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import FilterBar from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

export default function Page() {
    return (
        <div className="bg-backgroundmin-h-screen w-full">
            <Navbar />
            <FilterBar />
            <div className="flex w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                        
                </div>
            </div>
        </div>
    );
}
