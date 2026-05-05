// src/lib/sms.ts
// Semaphore SMS API - Philippine SMS Gateway
// Sign up free at https://semaphore.co

const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY
const SEMAPHORE_SENDER = process.env.SEMAPHORE_SENDER_NAME || "ABISOCON"
const SEMAPHORE_API_URL = "https://api.semaphore.co/api/v4/messages"

const LABELS = {
  IMMEDIATE: "POWER INTERRUPTION ALERT",
  ONE_HOUR_BEFORE: "POWER INTERRUPTION in 1 Hour",
  TEN_MIN_BEFORE: "POWER INTERRUPTION in 10 Minutes",
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!SEMAPHORE_API_KEY) {
    console.log("Semaphore API key not configured, skipping SMS")
    return false
  }

  try {
    // Convert +639XXXXXXXXX to 09XXXXXXXXX for Semaphore
    let number = to.trim()
    if (number.startsWith("+63")) {
      number = "0" + number.slice(3)
    } else if (number.startsWith("63")) {
      number = "0" + number.slice(2)
    }

    const params = new URLSearchParams({
      apikey: SEMAPHORE_API_KEY,
      number: number,
      message: message,
      sendername: SEMAPHORE_SENDER,
    })

    const res = await fetch(SEMAPHORE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const data = await res.json()

    if (Array.isArray(data) && data[0]?.status === "Queued") {
      console.log(`SMS queued for ${number}: ${data[0].message_id}`)
      return true
    } else {
      console.error("Semaphore SMS error:", JSON.stringify(data))
      return false
    }
  } catch (err) {
    console.error("SMS send error:", err)
    return false
  }
}

export function buildSMSMessage(
  type: "IMMEDIATE" | "ONE_HOUR_BEFORE" | "TEN_MIN_BEFORE",
  title: string,
  affectedAreas: string[],
  interruptionDate: string | null,
  startTime: string | null,
  endTime: string | null
): string {
  const label = LABELS[type]
  const areas = affectedAreas.slice(0, 4).join(", ") + (affectedAreas.length > 4 ? ` +${affectedAreas.length - 4} more` : "")
  const date = interruptionDate && interruptionDate !== "Date not specified" ? `\nDate: ${interruptionDate}` : ""
  const time = startTime && endTime ? `\nTime: ${startTime} - ${endTime}` : ""

  // Keep under 160 chars per SMS segment
  return `ABISO CONNECT\n${label}\n\n${title}${date}${time}\nArea: ${areas}\n\nPrepare now! Charge devices & store water.\n-SORECO II`
}
