import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InitiateTransferRequest {
  recipientAddress: string;
  amount: number;
  purpose?: string;
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

    const { recipientAddress, amount, purpose }: InitiateTransferRequest = await req.json();

    // Validate input
    if (!recipientAddress || !amount || amount <= 0) {
      throw new Error("Invalid transfer details");
    }

    // Get sender's wallet
    const { data: senderWallet, error: senderError } = await supabase
      .from("tau_wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (senderError || !senderWallet) {
      throw new Error("Sender wallet not found");
    }

    if (senderWallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    if (amount > senderWallet.daily_transfer_limit) {
      throw new Error("Amount exceeds daily transfer limit");
    }

    // Check recipient exists
    const { data: recipientWallet, error: recipientError } = await supabase
      .from("tau_wallets")
      .select("id, wallet_address")
      .eq("wallet_address", recipientAddress)
      .single();

    if (recipientError || !recipientWallet) {
      throw new Error("Recipient wallet not found");
    }

    if (recipientWallet.id === senderWallet.id) {
      throw new Error("Cannot transfer to yourself");
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP
    const { data: otp, error: otpError } = await supabase
      .from("transfer_otps")
      .insert({
        user_id: user.id,
        code: otpCode,
        recipient_wallet_address: recipientAddress,
        amount: amount,
        purpose: purpose,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (otpError) {
      throw new Error("Failed to create OTP");
    }

    // In production, send OTP via email here
    // For now, log it (in real app, integrate with Resend or similar)
    console.log(`OTP for ${user.email}: ${otpCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        otpId: otp.id,
        message: "OTP sent to your email",
        // For testing, include code (remove in production)
        testCode: otpCode,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Initiate transfer error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Transfer initiation failed" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
