import { Resend } from "resend";

// curl -X POST http://localhost:8081/api/send-email
export const POST = async (_: Request) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "tattu.0310@gmail.com",
      to: ["tattu.0310@gmail.com", "h19981029@gmail.com"],
      subject: "ねこねこ通信",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });
    return Response.json({ status: "ok" });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
