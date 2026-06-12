// supabase/functions/admin-create-user/index.ts
// Edge Function (Deno). Menggunakan SERVICE ROLE KEY — hanya boleh di sisi server.
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { email, role, puskesmas_id, full_name } = await req.json();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { role, puskesmas_id, full_name },
  });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ user: data.user }), { status: 200 });
});
