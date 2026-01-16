import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptTransferRequest {
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

    const { transferId }: AcceptTransferRequest = await req.json();

    // Get pending transfer
    const { data: transfer, error: transferError } = await supabase
      .from("pending_transfers")
      .select("*")
      .eq("id", transferId)
      .eq("recipient_user_id", user.id)
      .single();

    if (transferError || !transfer) {
      throw new Error("Transfer not found");
    }

    if (transfer.status !== "pending") {
      throw new Error(`Transfer is already ${transfer.status}`);
    }

    // Check expiry
    if (new Date(transfer.expires_at) < new Date()) {
      await supabase
        .from("pending_transfers")
        .update({ status: "expired" })
        .eq("id", transferId);
      throw new Error("Transfer has expired");
    }

    const amount = Number(transfer.amount);
    const referenceId = `transfer_${transferId}`;

    // Use atomic transfer function to prevent race conditions
    const { data: transferResult, error: transferExecError } = await supabase.rpc(
      "execute_transfer",
      {
        p_sender_wallet_id: transfer.sender_wallet_id,
        p_recipient_wallet_id: transfer.recipient_wallet_id,
        p_amount: amount,
        p_description: transfer.purpose || "TAU Transfer",
        p_reference_id: referenceId,
      }
    );

    if (transferExecError) {
      console.error("Transfer execution error:", transferExecError);
      throw new Error(transferExecError.message || "Failed to execute transfer");
    }

    // Mark transfer as accepted
    await supabase
      .from("pending_transfers")
      .update({ 
        status: "accepted", 
        accepted_at: new Date().toISOString() 
      })
      .eq("id", transferId);

    // Get profiles for email notifications (using service role, bypasses RLS)
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("user_id", transfer.sender_user_id)
      .single();

    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("user_id", user.id)
      .single();

    const newSenderBalance = transferResult?.sender_balance ?? 0;
    const newRecipientBalance = transferResult?.recipient_balance ?? 0;

    // Send notification emails
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        // Notify sender
        if (senderProfile?.email) {
          await resend.emails.send({
            from: "Webgrow <noreply@webgrow.com.ng>",
            to: [senderProfile.email],
            subject: "Your TAU Transfer Was Accepted!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #10b981; margin-bottom: 24px;">Transfer Completed</h1>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  Hello ${senderProfile.display_name || 'there'},
                </p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  <strong>${recipientProfile?.display_name || 'The recipient'}</strong> has accepted your transfer of <strong>${amount} TAU</strong>.
                </p>
                <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Amount Sent:</p>
                  <p style="font-size: 32px; font-weight: bold; color: #ef4444; margin: 0;">-${amount} TAU</p>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">New Balance: ${Number(newSenderBalance).toFixed(2)} TAU</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} Webgrow. All rights reserved.
                </p>
              </div>
            `,
          });
        }

        // Notify recipient
        if (recipientProfile?.email) {
          await resend.emails.send({
            from: "Webgrow <noreply@webgrow.com.ng>",
            to: [recipientProfile.email],
            subject: "TAU Transfer Received!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #10b981; margin-bottom: 24px;">Transfer Received</h1>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  Hello ${recipientProfile.display_name || 'there'},
                </p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                  You have successfully received <strong>${amount} TAU</strong> from <strong>${senderProfile?.display_name || 'a user'}</strong>.
                </p>
                <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Amount Received:</p>
                  <p style="font-size: 32px; font-weight: bold; color: #10b981; margin: 0;">+${amount} TAU</p>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">New Balance: ${Number(newRecipientBalance).toFixed(2)} TAU</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} Webgrow. All rights reserved.
                </p>
              </div>
            `,
          });
        }

        console.log("Notification emails sent to both parties");
      } catch (emailError) {
        console.error("Failed to send notification emails:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfer accepted successfully",
        amount: amount,
        newBalance: newRecipientBalance,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Accept transfer error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to accept transfer" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});