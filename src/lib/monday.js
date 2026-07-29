// Monday.com CRM client. SERVER SIDE ONLY - never import this into a component
// that ships to the browser, or the API token would be exposed.
//
// Board: "CRM*" (id in MONDAY_BOARD_ID). Melissa's saved website view filters on
// Referral source = "West Linn Page" AND owner = assigned-to-me, so every lead
// sets both or it will not show up in the view she actually watches.

const MONDAY_API = "https://api.monday.com/v2";
const API_VERSION = "2023-10";

// Value Melissa's saved board view filters on. Changing this hides new leads.
export const REFERRAL_SOURCE = "West Linn Page";

// Verified against the live board: a 1000-char value round-trips intact.
const NOTE_MAX = 1000;

// Board groups, so a lead files itself under the right bucket on arrival.
const ROLE_MAP = {
  buyer: { groupId: "new_group43041", typeLabel: "Buying" },
  seller: { groupId: "new_group29179", typeLabel: "Selling" },
  both: { groupId: "new_group__1", typeLabel: "Buying AND Selling" },
};

const COL = {
  email: "email__1",
  phone: "phone__1",
  type: "label__1",
  stage: "project_status",
  owner: "project_owner",
  referralSource: "referral_source__1",
  notes: "text9",
};

// process.env ONLY, and never with a computed key against import.meta.env:
// Vite statically inlines import.meta.env, so a dynamic lookup bakes every
// secret into the build artifact. Vercel provides these at runtime.
function env(key) {
  return process.env[key];
}

/** US phone -> the digits Monday expects. Returns null if it does not look valid. */
export function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  return null;
}

async function mondayRequest(query, variables) {
  const token = env("MONDAY_API_TOKEN");
  if (!token) throw new Error("MONDAY_API_TOKEN is not set");

  const res = await fetch(MONDAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": API_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Monday HTTP ${res.status}`);
  // Monday returns 200 with an `errors` array on GraphQL failures.
  if (body?.errors?.length) {
    throw new Error(`Monday API: ${body.errors.map((e) => e.message).join("; ")}`);
  }
  return body?.data;
}

const CREATE_ITEM = `
mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
  create_item(
    board_id: $boardId,
    group_id: $groupId,
    item_name: $itemName,
    column_values: $columnValues
  ) { id }
}`;

/**
 * Create a CRM item from a website lead.
 * @returns {Promise<{id: string}>} the new Monday item id
 */
export async function createLead(lead) {
  const boardId = env("MONDAY_BOARD_ID");
  if (!boardId) throw new Error("MONDAY_BOARD_ID is not set");

  const role = ROLE_MAP[lead.role] || ROLE_MAP.buyer;
  const ownerId = env("MONDAY_OWNER_ID");
  const itemName = `${lead.firstName} ${lead.lastName}`.trim();

  // TCPA: record the consent decision, when it was given, and which wording was
  // shown, so the answer to "did they agree to texts?" is auditable later.
  const consentNote = lead.smsConsent
    ? `SMS consent GRANTED ${lead.receivedAt} (${lead.consentVersion})`
    : "SMS consent: not given";
  // Contact submissions carry the visitor's own words; the report/valuation
  // forms carry which neighborhood was asked about. Metadata and the consent
  // record go first so they survive if a long message is trimmed.
  const isContact = lead.formType === "contact";
  const notes = [
    isContact ? "Contact form" : `Website lead: ${lead.formType}`,
    !isContact && lead.neighborhood ? `neighborhood ${lead.neighborhood}` : null,
    lead.address ? `address ${lead.address}` : null,
    consentNote,
    lead.message ? `Message: ${lead.message}` : null,
  ]
    .filter(Boolean)
    .join(" | ")
    .slice(0, NOTE_MAX);

  const columnValues = {
    [COL.email]: { email: lead.email, text: lead.email },
    [COL.type]: { label: role.typeLabel },
    [COL.stage]: { label: "Lead" },
    [COL.referralSource]: REFERRAL_SOURCE,
    [COL.notes]: notes,
  };

  const phone = normalizePhone(lead.phone);
  if (phone) columnValues[COL.phone] = { phone, countryShortName: "US" };

  // Owner drives her "assigned to me" view filter.
  if (ownerId) {
    columnValues[COL.owner] = {
      personsAndTeams: [{ id: Number(ownerId), kind: "person" }],
    };
  }

  const data = await mondayRequest(CREATE_ITEM, {
    boardId: String(boardId),
    groupId: role.groupId,
    itemName: itemName || lead.email,
    columnValues: JSON.stringify(columnValues),
  });

  return { id: data?.create_item?.id };
}
