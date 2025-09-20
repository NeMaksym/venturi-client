export function isValidUnixMillis(value: number): boolean {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        new Date(value).getTime() === value
    )
}
