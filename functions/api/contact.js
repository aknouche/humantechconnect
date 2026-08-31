// Cloudflare Pages Function — handles POST /api/contact
// Sends the contact form via the Resend API (https://resend.com).
//
// Required environment variables (set in Cloudflare Pages → Settings → Environment variables):
//   RESEND_API_KEY   — API key from resend.com
//   CONTACT_TO_EMAIL — the inbox that should receive form submissions
//
// Optional:
//   CONTACT_FROM_EMAIL — sender address (defaults to Resend's shared test domain)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: "invalid-json" }, 400);
  }

  // Honeypot: bots fill every field, including this hidden one.
  // Pretend success so bots don't learn to skip it.
  if (data.website) {
    return jsonResponse({ ok: true }, 200);
  }

  const name = (data.name || "").trim().slice(0, 200);
  const email = (data.email || "").trim().slice(0, 200);
  const company = (data.company || "").trim().slice(0, 200);
  const message = (data.message || "").trim().slice(0, 5000);

  if (!name || !company || !message || !EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: "invalid-fields" }, 400);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    return jsonResponse({ ok: false, error: "not-configured" }, 500);
  }

  const fromEmail = env.CONTACT_FROM_EMAIL || "HumanTechConnect <onboarding@resend.dev>";

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: "Nytt strategisamtal — " + company,
      text:
        "Namn: " + name + "\n" +
        "E-post: " + email + "\n" +
        "Bolag: " + company + "\n\n" +
        "Meddelande:\n" + message,
    }),
  });

  if (!resendRes.ok) {
    return jsonResponse({ ok: false, error: "send-failed" }, 502);
  }

  return jsonResponse({ ok: true }, 200);
}
