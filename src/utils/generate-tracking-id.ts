import crypto from "crypto";

/**
 * Generates a secure, human-readable tracking number.
 * Format: PKY-YYMM-XXXX (e.g., PKY-2603-X7B2)
 */
export function generateTrackingID(): string {
  const prefix = "PKY";

  // 1. Get the current Year and Month (YYMM)
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2); // "2026" -> "26"
  const month = String(now.getMonth() + 1).padStart(2, "0"); // "3" -> "03"

  // 2. Define the safe alphabet (Excluding 0, O, 1, I, 8, B)
  // Length: 30 characters
  const safeChars = "2345679ACDEFGHJKLMNPQRSTUVWXYZ";
  const randomLength = 4;

  let randomPart = "";

  // 3. Generate the secure random string
  for (let i = 0; i < randomLength; i++) {
    // crypto.randomInt is secure and perfectly distributed
    const randomIndex = crypto.randomInt(0, safeChars.length);
    randomPart += safeChars[randomIndex];
  }

  // 4. Combine them all
  return `${prefix}-${year}${month}-${randomPart}`;
}
