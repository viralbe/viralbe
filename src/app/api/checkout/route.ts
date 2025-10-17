// src/app/api/checkout/route.ts
import { currentUser } from "@clerk/nextjs/server"; // <- IMPORT ESSENCIAL
import Stripe from "stripe";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // garante runtime compatível

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: Request) {
  try {
    console.log("🟡 Iniciando checkout...");

    // 🔒 currentUser vem do Clerk (server)
    const user = await currentUser();
    console.log("🟢 Usuário:", user?.id);

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "Usuário não autenticado.",
        }),
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    console.log("📦 Body recebido:", body);

    const priceId = process.env.STRIPE_PRICE_ID;
    console.log("💰 STRIPE_PRICE_ID:", priceId);

    if (!priceId) {
      console.error("❌ STRIPE_PRICE_ID não configurado");
      return new Response(
        JSON.stringify({
          error: "missing_price",
          message: "ID do preço Stripe não configurado.",
        }),
        { status: 500 }
      );
    }

    console.log("🔍 Buscando usuário no Prisma...");
    const existing = await prisma.userSearch.findUnique({
      where: { userId: user.id },
    });

    let customerId: string | undefined;
    if (existing?.stripeCustomer) {
      console.log("🟢 Já existe customer:", existing.stripeCustomer);
      customerId = existing.stripeCustomer;
    } else {
      console.log("🟠 Criando novo customer no Stripe...");
      const customer = await stripe.customers.create({
        email: user.emailAddresses?.[0]?.emailAddress,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      console.log("🟢 Novo customer criado:", customerId);

      await prisma.userSearch.upsert({
        where: { userId: user.id },
        create: { userId: user.id, stripeCustomer: customerId },
        update: { stripeCustomer: customerId },
      });
      console.log("💾 Customer salvo no banco");
    }

    console.log("🧾 Criando sessão de checkout...");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: process.env.STRIPE_FIRST_COUPON_ID
        ? [{ coupon: process.env.STRIPE_FIRST_COUPON_ID }]
        : undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      metadata: { userId: user.id },
    });

    console.log("✅ Sessão criada:", session.id);
    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (err: unknown) {
    console.error("❌ ERRO DETALHADO NO CHECKOUT:", err);

    const message = err instanceof Error ? err.message : "Erro interno ao iniciar checkout.";

    return new Response(
      JSON.stringify({
        error: "checkout_failed",
        message,
      }),
      { status: 500 }
    );
  }
}
