"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function subscribeToWaitlist(email: string, source: string = "pricing_waitlist") {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    const supabase = await createServerClient();

    // Try to insert or update the email
    const { data, error } = await supabase
      .from("user_emails")
      .upsert(
        {
          email,
          source,
          subscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: "Failed to subscribe. Please try again." };
    }

    return {
      success: true,
      message: "You're on the list! We'll notify you when paid plans launch.",
      data,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
