import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAN_MAP: Record<string, string> = {
  'starter':  'starter',
  'pro':      'pro',
  'premium':  'premium',
};

Deno.serve(async (req) => {
  const body = await req.json();
  const event = body.meta?.event_name;

  if (event !== 'order_created' && event !== 'subscription_created') {
    return new Response('ignored', { status: 200 });
  }

  const userId    = body.meta?.custom_data?.user_id;
  const planKey   = body.meta?.custom_data?.plan ?? 'pro';
  const plan      = PLAN_MAP[planKey] ?? 'pro';

  if (!userId) return new Response('no user_id', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabase
    .from('profiles')
    .update({ subscription_plan: plan })
    .eq('id', userId);

  return new Response('ok', { status: 200 });
});
