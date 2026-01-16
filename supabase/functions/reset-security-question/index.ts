import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetSecurityQuestionRequest {
  password: string;
  newQuestionId: string;
  newAnswer: string;
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

    const { password, newQuestionId, newAnswer }: ResetSecurityQuestionRequest = await req.json();

    if (!password || !newQuestionId || !newAnswer) {
      throw new Error("Password, new question, and new answer are required");
    }

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
    });

    if (signInError) {
      throw new Error("Invalid password");
    }

    // Verify the question exists
    const { data: question, error: questionError } = await supabase
      .from("security_questions")
      .select("id")
      .eq("id", newQuestionId)
      .eq("is_active", true)
      .single();

    if (questionError || !question) {
      throw new Error("Invalid security question");
    }

    // Hash the answer (simple hash for now - in production use proper hashing)
    const encoder = new TextEncoder();
    const data = encoder.encode(newAnswer.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const answerHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Check if user has existing security answer
    const { data: existingAnswer } = await supabase
      .from("user_security_answers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingAnswer) {
      // Update existing
      const { error: updateError } = await supabase
        .from("user_security_answers")
        .update({
          question_id: newQuestionId,
          answer_hash: answerHash,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error("Failed to update security question");
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from("user_security_answers")
        .insert({
          user_id: user.id,
          question_id: newQuestionId,
          answer_hash: answerHash,
        });

      if (insertError) {
        throw new Error("Failed to save security question");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Security question updated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Reset security question error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to reset security question" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
