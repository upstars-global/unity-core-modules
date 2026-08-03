// @ts-expect-error -- TS7006: Parameter 'str' implicitly has an 'any' type.
export function nicknameReplace(str) {
    return `${ str.slice(0, 6) }***`;
}
