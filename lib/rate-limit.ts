// lib/rate-limit.ts — server-only
import { adminSupabase } from '@/lib/supabase/admin';
import crypto from 'crypto';

interface RateLimitResult {
  allowed: boolean;
  blocked: boolean;
  blockedUntil?: Date;
}

export function hashIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + process.env.ADMIN_UID)
    .digest('hex');
}

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number,
  lockoutSeconds: number
): Promise<RateLimitResult> {
  const id = hashIp(ip + endpoint);
  const now = new Date();

  const { data: existing, error: fetchError } = await adminSupabase
    .from('rate_limits')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    console.error('[rate-limit] fetch error:', fetchError);
    return { allowed: true, blocked: false };
  }

  // No existing record — create it and allow
  if (!existing) {
    const { error: insertError } = await adminSupabase.from('rate_limits').insert([
      {
        id,
        count: 1,
        window_start: now.toISOString(),
        blocked_until: null,
      },
    ]);
    if (insertError) console.error('[rate-limit] insert error:', insertError);
    return { allowed: true, blocked: false };
  }

  // Currently blocked
  if (existing.blocked_until && new Date(existing.blocked_until) > now) {
    return { allowed: false, blocked: true, blockedUntil: new Date(existing.blocked_until) };
  }

  // Window expired — reset
  const windowAge = now.getTime() - new Date(existing.window_start).getTime();
  if (windowAge > windowSeconds * 1000) {
    await adminSupabase
      .from('rate_limits')
      .update({ count: 1, window_start: now.toISOString(), blocked_until: null })
      .eq('id', id);
    return { allowed: true, blocked: false };
  }

  // Increment count
  const newCount = existing.count + 1;
  if (newCount > maxRequests) {
    const blockedUntil = new Date(now.getTime() + lockoutSeconds * 1000);
    await adminSupabase
      .from('rate_limits')
      .update({ count: newCount, blocked_until: blockedUntil.toISOString() })
      .eq('id', id);
    return { allowed: false, blocked: true, blockedUntil };
  }

  await adminSupabase.from('rate_limits').update({ count: newCount }).eq('id', id);
  return { allowed: true, blocked: false };
}
