export function mobilePhoneAutoEditorForAU(num: string) {
    if (num && num.length === 12) {
        if ([ "+04", "+05" ].includes(num.substring(0, 3))) {
            return `+61${ num.slice(3) }`;
        }
    }
    return num;
}

export function mobilePhoneAUWithDoubleCode(num: string) {
    const firstMatch = num.match(/^610[458]/);
    if (firstMatch) {
        return num.replace("0", "");
    }

    return num;
}
