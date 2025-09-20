export function isIBAN(value: string): boolean {
    // Reject any whitespace
    if (/\s/.test(value)) return false
    // Enforce maximum length 34
    if (value.length > 34) return false
    // Require two leading letters (country code)
    if (!/^[A-Za-z]{2}/.test(value)) return false
    // Allow only letters and digits
    if (!/^[A-Za-z0-9]+$/.test(value)) return false

    return true
}
