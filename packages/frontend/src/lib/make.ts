export function getDeptWebhook(deptId: string): string | undefined {
  const env: any = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const key = `VITE_MAKE_WEBHOOK_${String(deptId).toUpperCase()}`;
  const url = (env[key] as string | undefined) || undefined;
  if (!url) return undefined;
  const valid = /^https:\/\/hook\.[a-z0-9.-]+\.make\.com\//i.test(url);
  return valid ? url : undefined;
}



