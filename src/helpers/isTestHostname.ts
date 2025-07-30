export function isTestHostname(hostname: string): boolean {
    return hostname.endsWith("rocketplay.wlabel.site") || hostname === "rocketplay.life";
}
