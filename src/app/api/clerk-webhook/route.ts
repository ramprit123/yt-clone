import { NextResponse } from "next/server";
import { db } from "@/server/db"; // Ensure correct DB import
import { users } from "@/server/db/schema"; // Ensure schema path
import { Webhook } from "svix"; // Clerk uses Svix for webhook verification

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

// Define a type for the expected event data
interface WebhookEventData {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string;
  last_name: string;
}

export async function POST(req: Request) {
  if (!CLERK_WEBHOOK_SECRET) {
    console.error("Missing Clerk Webhook Secret");
    return NextResponse.json(
      { message: "Server misconfiguration" },
      { status: 500 },
    );
  }

  // Extract and verify Svix headers
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  if (!svixHeaders["svix-id"] || !svixHeaders["svix-signature"]) {
    return NextResponse.json(
      { message: "Invalid webhook headers" },
      { status: 400 },
    );
  }

  let event: { data: WebhookEventData };
  try {
    const body = await req.text(); // Read raw request body
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    event = wh.verify(body, svixHeaders) as { data: WebhookEventData }; // Use specific type
  } catch (error) {
    console.error("Webhook verification failed", error);
    return NextResponse.json(
      { message: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  // Extract user data from webhook
  if (event && typeof event === "object" && "data" in event) {
    const { id: clerkId, email_addresses, first_name, last_name } = event.data;

    try {
      await db.insert(users).values({
        clerkId,
        name: `${first_name} ${last_name}`.trim(),
        email: email_addresses[0]?.email_address ?? "",
      });

      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 },
      );
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Error creating user" },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      { message: "Invalid event data" },
      { status: 400 },
    );
  }
}
