import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;
const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

const VARIANT_MAP: Record<string, string> = {
  starter: process.env.LS_VARIANT_STARTER || "",
  pro: process.env.LS_VARIANT_PRO || "",
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await req.json();
    const variantId = VARIANT_MAP[plan];
    if (!variantId) return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });

    const resp = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LS_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: session.user.email,
              custom: { userId: session.user.id },
            },
            product_options: {
              redirect_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: LS_STORE_ID } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });

    const data = await resp.json();
    const checkoutUrl = data?.data?.attributes?.url;

    if (!checkoutUrl) return NextResponse.json({ error: "Checkout oluşturulamadı" }, { status: 500 });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
