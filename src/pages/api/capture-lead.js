// Lewis Realtors - lead capture endpoint.
//
// Receives the market-report and home-valuation forms, validates the payload,
// and creates the lead on Melissa's monday.com CRM board.
//
// Expected POST JSON:
//   { firstName, lastName, email, phone, role: 'buyer'|'seller'|'both',
//     smsConsent: bool, address?, formType: 'market-report'|'valuation',
//     neighborhood: '<slug>'|'west-linn', pageUrl?, token: '<turnstile token>' }

import { createLead, normalizePhone } from "../../lib/monday.js";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["buyer", "seller", "both"]);
const FORM_TYPES = new Set(["market-report", "valuation", "contact"]);

// The CRM Notes column is a single-line text field, so a message is collapsed
// and capped rather than pasted in raw.
const MESSAGE_MAX = 700;

// Bump when the consent wording in MarketReportForm.astro changes, so an old
// record always points at the exact text that person was shown.
const CONSENT_VERSION = "sms-consent-v1";

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

  const firstName = (body.firstName || "").trim();
  const lastName = (body.lastName || "").trim();
  const email = (body.email || "").trim();
  const phoneRaw = (body.phone || "").trim();
  const role = ROLES.has(body.role) ? body.role : null;
  const smsConsent = body.smsConsent === true;
  const formType = FORM_TYPES.has(body.formType) ? body.formType : "market-report";
  const neighborhood = (body.neighborhood || "west-linn").trim();
  const address = (body.address || "").trim();
  // Collapse newlines/runs of whitespace so the note stays one clean line.
  const message = (body.message || "").replace(/\s+/g, " ").trim().slice(0, MESSAGE_MAX);

  if (firstName.length < 1) return json({ ok: false, error: "Please enter your first name." }, 422);
  if (lastName.length < 1) return json({ ok: false, error: "Please enter your last name." }, 422);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please enter a valid email." }, 422);
  if (!normalizePhone(phoneRaw)) {
    return json({ ok: false, error: "Please enter a valid US phone number." }, 422);
  }
  if (!role) return json({ ok: false, error: "Please tell me whether you're buying or selling." }, 422);
  if (formType === "contact" && message.length < 2) {
    return json({ ok: false, error: "Please tell me how I can help." }, 422);
  }

  const lead = {
    firstName,
    lastName,
    email,
    phone: phoneRaw,
    role,
    smsConsent,
    consentVersion: CONSENT_VERSION,
    address: address || null,
    message: message || null,
    formType,
    neighborhood,
    receivedAt: new Date().toISOString(),
  };

  // TODO(1): Verify Cloudflare Turnstile before trusting the submission:
  //   const ok = await verifyTurnstile(body.token, request);
  //   if (!ok) return json({ ok: false, error: "Captcha failed." }, 403);

  // Push to the CRM. One retry covers a transient blip; a hard failure tells the
  // visitor to call rather than silently swallowing the lead.
  let itemId = null;
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await createLead(lead);
      itemId = result.id;
      break;
    } catch (err) {
      lastErr = err;
      if (attempt === 1) await new Promise((r) => setTimeout(r, 400));
    }
  }

  if (!itemId) {
    // Recovery record: this is the only path that logs contact details, so a
    // lead is never lost outright. Keep it off the success path.
    console.error(
      "[capture-lead] CRM push FAILED:",
      lastErr?.message,
      JSON.stringify({ ...lead, recovery: true })
    );
    return json(
      { ok: false, error: "We couldn't save that just now. Please call (503) 489-8367." },
      502
    );
  }

  // Success path logs no personal data.
  console.log(`[capture-lead] lead created: item=${itemId} type=${formType} hood=${neighborhood}`);

  const reply =
    formType === "valuation"
      ? "Thank you. Melissa will reach out with your personalized valuation."
      : formType === "contact"
        ? "Thank you. Melissa will get back to you personally."
        : "Thank you. Your market report is on the way to your inbox.";

  return json({ ok: true, message: reply });
}

// Reject other methods cleanly.
export async function GET() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
