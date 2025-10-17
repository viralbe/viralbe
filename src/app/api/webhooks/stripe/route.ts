// src/app/api/webhooks/stripe/route.ts
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Escutar checkout.session.completed (assinatura criada/confirmada)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId as string | undefined;

      if (userId) {
        await prisma.userSearch.update({
          where: { userId },
          data: { isPro: true },
        });
      } else if (session.customer) {
        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        if (stripeCustomerId) {
          await prisma.userSearch.updateMany({
            where: { stripeCustomer: stripeCustomerId },
            data: { isPro: true },
          });
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err: unknown) {
    console.error("Webhook error:", err);

    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }
}
