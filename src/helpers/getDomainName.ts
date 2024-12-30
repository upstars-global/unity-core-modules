export const getDomainName = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    return parts.length > 2 ? parts.slice(1).join(".") : hostname;
};
