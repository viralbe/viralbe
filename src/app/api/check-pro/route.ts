import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });

    const record = await prisma.userSearch.findUnique({ where: { userId: user.id } });

    if (!record?.stripeCustomer) return new Response(JSON.stringify({ isPro: false, remaining: 3 }), { status: 200 });

    const subscriptions = await stripe.subscriptions.list({
      customer: record.stripeCustomer,
      status: "active",
      limit: 1,
    });

    const isPro = subscriptions.data.length > 0;
    const remaining = isPro ? "∞" : 3;

    return new Response(JSON.stringify({ isPro, remaining }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500 });
  }
}
