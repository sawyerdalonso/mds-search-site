// Netlify Forms does not enforce `required` on the server, so anything that posts
// a form directly (bots, scanners) reaches Howard as a blank notification. Turn
// those away here. Keep these names in sync with contact.html and candidates.html.
const requiredFields = new Map([
  ["contact", ["name", "email", "type", "message"]],
  ["candidate-intake", ["name", "email"]]
]);

const rejectedPage = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Message not sent | MDS Search</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5">
<h1>Your message was not sent</h1>
<p>A required field was empty. Please go back and complete the form, or email
<a href="mailto:howard@mdssearch.com">howard@mdssearch.com</a>.</p>
</body>
</html>`;

const isComplete = (fields, required) =>
  required.every(name => String(fields.get(name) ?? "").trim()) &&
  /^[^\s@]+@[^\s@]+$/.test(String(fields.get("email")).trim());

export default async (request, context) => {
  // A body can only be read once, so Forms receives a fresh copy of these bytes.
  const body = await request.arrayBuffer();
  const forward = () => context.next(new Request(request, { body }));

  let fields;
  try {
    const headers = { "content-type": request.headers.get("content-type") ?? "" };
    fields = await new Response(body, { headers }).formData();
  } catch (error) {
    return forward();
  }

  const formName = fields.get("form-name");
  const required = requiredFields.get(formName);
  if (!required || isComplete(fields, required)) return forward();

  console.log(`Rejected incomplete ${formName} post`, request.headers.get("user-agent"));
  return new Response(rejectedPage, {
    status: 422,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
};

// A failure here must never cost a real enquiry: skip the guard and let Forms decide.
export const config = { path: "/*", method: "POST", onError: "bypass" };
