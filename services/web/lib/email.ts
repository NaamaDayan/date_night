/**
 * MVP: Log email content (or use Ethereal). No real SMTP required.
 */

type EmailParams = {
  player1Link: string;
  player2Link: string;
  tvLink: string;
};

export async function sendEmailMock(params: EmailParams): Promise<void> {
  if (process.env.NODE_ENV !== "test") {
    console.log("[Email mock] Your game links:");
    console.log("  Link 1 (your phone):", params.player1Link);
    console.log("  Link 2 (partner's phone):", params.player2Link);
    console.log("  TV (optional):", params.tvLink);
  }
}
