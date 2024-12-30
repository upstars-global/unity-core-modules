import { storeToRefs } from "pinia";
import { v4 as uuid } from "uuid";

import { isServer } from "../../helpers/ssrHelpers";
import { useEnvironments } from "../../store/environments";
import { useUserInfo } from "../../store/user/userInfo";

const PIXEL_URL = "https://ck-grd.com/pixel.png?project=alpa";

export function usePixelCkGRD() {
    let savedUserId: number | null | undefined = null;

    async function updateUrlPixelCkGRD() {
        if (isServer) {
            return;
        }

        const { isProduction } = storeToRefs(useEnvironments());
        if (!isProduction.value) {
            return;
        }

        const { getUserInfo } = storeToRefs(useUserInfo());

        const url = new URL(PIXEL_URL);

        const userId = getUserInfo.value.id as (number | undefined);
        if (userId === savedUserId) {
            return;
        }
        savedUserId = userId;

        if (userId) {
            url.searchParams.set("user_id", userId.toString());
        }
        url.searchParams.set("uid", uuid() + Date.now());

        const img = document.createElement("img");
        img.width = 0;
        img.height = 0;
        img.src = url.toString();
        img.onload = img.onerror = () => {
            document.body.removeChild(img);
        };
        document.body.appendChild(img);
    }

    return {
        updateUrlPixelCkGRD,
    };
}
