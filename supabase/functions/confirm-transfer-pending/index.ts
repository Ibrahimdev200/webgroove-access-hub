import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmTransferPendingRequest {
  otpId: string;
  code: string;
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

    const { otpId, code }: ConfirmTransferPendingRequest = await req.json();

    // Get OTP record
    const { data: otp, error: otpError } = await supabase
      .from("transfer_otps")
      .select("*")
      .eq("id", otpId)
      .eq("user_id", user.id)
      .single();

    if (otpError || !otp) {
      throw new Error("OTP not found");
    }

    // Check if already used
    if (otp.used_at) {
      throw new Error("OTP already used");
    }

    // Check expiry
    if (new Date(otp.expires_at) < new Date()) {
      throw new Error("OTP expired");
    }

    // Check attempts
    if (otp.attempts >= 3) {
      throw new Error("Too many attempts. Please request a new OTP");
    }

    // Verify code
    if (otp.code !== code) {
      // Increment attempts
      await supabase
        .from("transfer_otps")
        .update({ attempts: otp.attempts + 1 })
        .eq("id", otpId);
      
      throw new Error("Invalid OTP code");
    }

    // Mark OTP as used
    await supabase
      .from("transfer_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpId);

    // Get sender wallet
    const { data: senderWallet, error: senderError } = await supabase
      .from("tau_wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (senderError || !senderWallet) {
      throw new Error("Sender wallet not found");
    }

    // Get recipient wallet
    const { data: recipientWallet, error: recipientError } = await supabase
      .from("tau_wallets")
      .select("*")
      .eq("wallet_address", otp.recipient_wallet_address)
      .single();

    if (recipientError || !recipientWallet) {
      throw new Error("Recipient wallet not found");
    }

    const amount = Number(otp.amount);

    // Check balance again
    if (Number(senderWallet.balance) < amount) {
      throw new Error("Insufficient balance");
    }

    // Create pending transfer (48 hours expiry)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const { data: pendingTransfer, error: insertError } = await supabase
      .from("pending_transfers")
      .insert({
        sender_wallet_id: senderWallet.id,
        sender_user_id: user.id,
        recipient_wallet_id: recipientWallet.id,
        recipient_user_id: recipientWallet.user_id,
        amount: amount,
        purpose: otp.purpose,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to create pending transfer");
    }

    // Get recipient's profile to send notification
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("user_id", recipientWallet.user_id)
      .single();

    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    // Send notification email to recipient
    if (resendApiKey && recipientProfile?.email) {
      try {
        const resend = new Resend(resendApiKey);
        
        await resend.emails.send({
          from: "Webgrow <noreply@webgrow.com.ng>",
          to: [recipientProfile.email],
          subject: "You Have a Pending TAU Transfer!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #10b981; margin-bottom: 24px;">Incoming TAU Transfer</h1>
              <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                Hello ${recipientProfile.display_name || 'there'},
              </p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                <strong>${senderProfile?.display_name || 'Someone'}</strong> wants to send you <strong>${amount} TAU</strong>.
              </p>
              ${otp.purpose ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Purpose: ${otp.purpose}</p>` : ''}
              <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Transfer Amount:</p>
                <p style="font-size: 32px; font-weight: bold; color: #10b981; margin: 0;">${amount} TAU</p>
              </div>
              <p style="font-size: 14px; color: #374151; margin-bottom: 16px;">
                Log in to your Webgrow dashboard to accept this transfer. The transfer will expire in 48 hours if not accepted.
              </p>
              <p style="font-size: 14px; color: #6b7280;">
                From wallet: ${senderWallet.wallet_address}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Webgrow. All rights reserved.
              </p>
            </div>
          `,
        });
        console.log("Notification email sent to recipient");
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transferId: pendingTransfer.id,
        message: "Transfer created. Waiting for recipient to accept.",
        expiresAt: expiresAt.toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Confirm transfer pending error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to confirm transfer" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
