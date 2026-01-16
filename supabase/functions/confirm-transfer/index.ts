import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmTransferRequest {
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

    const { otpId, code }: ConfirmTransferRequest = await req.json();

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
    const transferId = crypto.randomUUID();

    // Use atomic transfer function to prevent race conditions
    const { data: transferResult, error: transferExecError } = await supabase.rpc(
      "execute_transfer",
      {
        p_sender_wallet_id: senderWallet.id,
        p_recipient_wallet_id: recipientWallet.id,
        p_amount: amount,
        p_description: otp.purpose || "TAU Transfer",
        p_reference_id: transferId,
      }
    );

    if (transferExecError) {
      console.error("Transfer execution error:", transferExecError);
      throw new Error(transferExecError.message || "Failed to execute transfer");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfer completed successfully",
        transferId: transferId,
        amount: amount,
        newBalance: transferResult?.sender_balance ?? 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Confirm transfer error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Transfer confirmation failed" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});