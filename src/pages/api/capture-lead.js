// Lewis Realtors - lead capture endpoint (STUB).
//
// Receives the market-report and home-valuation forms. For now it validates the
// payload and returns success so the front end can be exercised end to end.
// Wire the three TODO sections below once credentials are provided.
//
// Expected POST JSON:
//   { name, email, address?, formType: 'market-report' | 'valuation',
//     neighborhood: '<slug>' | 'west-linn', token: '<turnstile token>' }

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const formType = body.formType === "valuation" ? "valuation" : "market-report";
  const neighborhood = (body.neighborhood || "west-linn").trim();
  const address = (body.address || "").trim();

  if (!name || name.length < 2) return json({ ok: false, error: "Please enter your name." }, 422);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please enter a valid email." }, 422);

  // The lead, tagged so Melissa knows exactly what was requested.
  const lead = {
    name,
    email,
    address: address || null,
    formType,
    neighborhood,
    receivedAt: new Date().toISOString(),
    source: "lewisrealtors.com",
  };

  // TODO(1): Verify Cloudflare Turnstile before trusting the submission:
  //   const ok = await verifyTurnstile(body.token, request);
  //   if (!ok) return json({ ok: false, error: "Captcha failed." }, 403);

  // TODO(2): Push a phone notification to the agent (e.g. ntfy.sh):
  //   await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
  //     method: "POST",
  //     headers: { Title: `New ${formType} lead: ${neighborhood}`, Priority: "high" },
  //     body: `${name} (${email}) requested the ${neighborhood} ${formType}.`,
  //   });

  // TODO(3): Trigger the report / valuation email via the chosen provider
  //   (Resend, Postmark, SendGrid, etc.), attaching the correct neighborhood report.

  // For now, log so the lead is visible in dev/server output.
  console.log("[capture-lead] new lead:", lead);

  const message =
    formType === "valuation"
      ? "Thank you. Melissa will reach out with your personalized valuation."
      : "Thank you. Your market report is on the way to your inbox.";

  return json({ ok: true, message, lead: { neighborhood, formType } });
}

// Reject other methods cleanly.
export async function GET() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
