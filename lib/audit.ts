// lib/audit.ts — server-only
import { adminSupabase } from '@/lib/supabase/admin';
import type { AuditEvent } from '@/types';

interface AuditParams {
  event: AuditEvent;
  adminUid?: string | null;
  ipHash?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent({
  event,
  adminUid = null,
  ipHash = '',
  userAgent = '',
  metadata = {},
}: AuditParams) {
  try {
    await adminSupabase.from('admin_audit_log').insert([
      {
        event,
        admin_uid: adminUid,
        ip_hash: ipHash,
        user_agent: userAgent,
        metadata,
      },
    ]);
  } catch (err) {
    // Audit logging failures should never crash main operation
    console.error('[audit] Failed to log event:', err);
  }
}
