export function getOrCreateUserId(): string | null {
  // Verifica se está no ambiente do navegador
  if (typeof window === "undefined") return null;

  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("user_id", userId);
  }

  return userId;
}
