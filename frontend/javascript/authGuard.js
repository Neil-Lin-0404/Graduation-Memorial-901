import { api } from "./api.js";
import { router } from "./router.js";
import { createLogger } from "./logger.js";

const log = createLogger("authGuard");

export async function requireUser() {
  const user = await api.auth.getCurrentUser();
  if (!user) {
    log.info("requireUser:redirect", { to: "/auth" });
    router.navigate("/auth");
    return null;
  }
  return user;
}
