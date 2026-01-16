import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelTransferRequest {
  transferId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { transferId }: CancelTransferRequest = await req.json();

    // Get pending transfer - sender can cancel
    const { data: transfer, error: transferError } = await supabase
      .from("pending_transfers")
      .select("*")
      .eq("id", transferId)
      .eq("sender_user_id", user.id)
      .single();

    if (transferError || !transfer) {
      throw new Error("Transfer not found");
    }

    if (transfer.status !== "pending") {
      throw new Error(`Transfer is already ${transfer.status}`);
    }

    // Mark transfer as cancelled
    await supabase
      .from("pending_transfers")
      .update({ 
        status: "cancelled", 
        cancelled_at: new Date().toISOString() 
      })
      .eq("id", transferId);

    // Notify recipient that transfer was cancelled
    if (resendApiKey) {
      try {
        const { data: recipientProfile } = await supabase
          .from("profiles")
          .select("email, display_name")
          .eq("user_id", transfer.recipient_user_id)
          .single();

        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        if (recipientProfile?.email) {
          const resend = new Resend(resendApiKey);
          
          await resend.emails.send({
            from: "Webgrow <noreply@webgrow.com.ng>",
            to: [recipientProfile.email],
            subject: "Pending TAU Transfer Cancelled",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #f59e0b; margin-bottom: 24px;">Transfer Cancelled</h1>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  Hello ${recipientProfile.display_name || 'there'},
                </p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  The pending transfer of <strong>${transfer.amount} TAU</strong> from <strong>${senderProfile?.display_name || 'a user'}</strong> has been cancelled by the sender.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} Webgrow. All rights reserved.
                </p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfer cancelled successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Cancel transfer error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to cancel transfer" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
