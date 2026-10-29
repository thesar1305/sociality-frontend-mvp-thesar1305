/**
 * Analytics ringan (MVP Guide bagian 12): event untuk evaluasi UX.
 * Tanpa vendor — event dikirim sebagai CustomEvent di window, dicetak di
 * mode development, dan dikirim lewat sendBeacon bila
 * NEXT_PUBLIC_ANALYTICS_URL diisi. Tidak pernah melempar error.
 */
export type AnalyticsEvent =
  | 'post_view'
  | 'post_like'
  | 'post_unlike'
  | 'post_save'
  | 'post_unsave'
  | 'user_follow'
  | 'user_unfollow'
  | 'comment_submit';

type AnalyticsProps = Record<string, string | number | boolean>;

export const ANALYTICS_EVENT_NAME = 'sociality:analytics';

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload = { event, props, at: new Date().toISOString() };

    window.dispatchEvent(
      new CustomEvent(ANALYTICS_EVENT_NAME, { detail: payload })
    );

    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics]', event, props);
    }

    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_URL;

    if (endpoint && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(
        endpoint,
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
    }
  } catch {
    // Analytics tidak boleh mengganggu alur pengguna.
  }
}
