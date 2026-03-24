'use server';
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isEstateAgentById } from "@/lib/auth/role";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { email, grantedBy } = await req.json();
        const origin = new URL(req.url).origin;
        // check if user is an estate agent
        if (!grantedBy || !(await isEstateAgentById(grantedBy))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${origin}/auth/accept-invite`,
            data: {
                invited: true,
                role: "seller",
                granted_by: grantedBy,
            },
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Invitation sent" });
    } catch (error) {
        console.error("Error processing seller invite:", error);
        return NextResponse.json({ error: "Failed to process invite" }, { status: 500 });
    }
}