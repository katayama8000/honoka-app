import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const useSendEmail = () => {
  const sendMonthlyClosingEmail = useCallback(async (balance: number, month: string, partnerName?: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const isPositive = balance > 0;
      const absoluteBalance = Math.abs(balance);
      const amountText = isPositive
        ? `<strong>${partnerName || "相手"}から${absoluteBalance.toLocaleString()}円受け取り</strong>`
        : `<strong>${partnerName || "相手"}に${absoluteBalance.toLocaleString()}円支払い</strong>`;

      const apiUrl = __DEV__
        ? "http://localhost:8081/api/send-email"
        : "https://your-production-domain.com/api/send-email";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "ねこねこ通信",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #9575CD;">ねこねこ通信 📧</h2>
              <p>${month}の精算が完了しました。</p>
              <p>${amountText}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #666;">今月もパートナーを大事にね！ 💜</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send email:", await response.text());
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }, []);

  return { sendMonthlyClosingEmail };
};
