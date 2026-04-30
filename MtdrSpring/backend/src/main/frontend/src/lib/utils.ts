type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>

function toClassName(input: ClassValue): string {
  if (!input) return ""

  if (Array.isArray(input)) {
    return input.map(toClassName).filter(Boolean).join(" ")
  }

  if (typeof input === "object") {
    return Object.entries(input)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)
      .join(" ")
  }

  return String(input)
}

export function cn(...inputs: ClassValue[]) {
  return inputs.map(toClassName).filter(Boolean).join(" ")
}
