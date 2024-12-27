import { getAffiliateToCookie } from "../controllers/affiliateParam";

// @ts-expect-error Parameter '$router' implicitly has an 'any' type.
export function getAffiliate($router) {
    return $router?.currentRoute?.value?.query?.stag || getAffiliateToCookie() || "not set";
}
