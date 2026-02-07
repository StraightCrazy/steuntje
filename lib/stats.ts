export function trackView() {
  if (typeof window === "undefined") return;

  // Voor v1: alleen een hook
  // Later kan hier analytics / Supabase / Plausible / etc. in
  console.debug("[Steuntje] view tracked");
}
