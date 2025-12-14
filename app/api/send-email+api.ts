import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

type EmailRequestBody = {
  subject: string;
  html: string;
  to?: string[];
};

const validateEmailBody = (body: unknown): body is EmailRequestBody => {
  if (typeof body !== "object" || body === null) return false;

  const { subject, html, to } = body as Record<string, unknown>;

  if (typeof subject !== "string" || subject.trim().length === 0) return false;
  if (typeof html !== "string" || html.trim().length === 0) return false;
  if (to !== undefined && (!Array.isArray(to) || !to.every((item) => typeof item === "string"))) return false;

  return true;
};

export const POST = async (request: Request) => {
  try {
    // Authentication check
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized: Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    if (!validateEmailBody(body)) {
      return Response.json(
        { error: "Invalid request body. Required: subject (string), html (string), optional: to (string[])" },
        { status: 400 },
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const defaultTo = ["tattu.0310@gmail.com", "h19981029@gmail.com"];

    await resend.emails.send({
      from: "tattu.0310@gmail.com",
      to: body.to || defaultTo,
      subject: body.subject,
      html: body.html,
    });

    return Response.json({ status: "ok", message: "Email sent successfully" });
  } catch (e) {
    console.error("Email API error:", e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
