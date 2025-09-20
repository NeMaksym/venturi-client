export function isFourDigitString(value: string): boolean {
    return /^\d{4}$/.test(value)
}
