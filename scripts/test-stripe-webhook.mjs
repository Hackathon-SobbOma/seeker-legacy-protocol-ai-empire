import crypto from "node:crypto";

const port = process.env.PORT || "3000";
const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
const payload = JSON.stringify({ id: `evt_test_${Date.now()}`, type: "customer.subscription.updated", data: { object: {} } });
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

const response = await fetch(`http://localhost:${port}/api/stripe/webhook`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "stripe-signature": `t=${timestamp},v1=${signature}`,
  },
  body: payload,
});

const body = await response.text();
console.log(JSON.stringify({ status: response.status, body }));
if (response.status !== 200 || !body.includes('"verified":true')) {
  process.exit(1);
}
