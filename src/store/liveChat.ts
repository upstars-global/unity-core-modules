import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useLivechatStore = defineStore("livechatStore", () => {
    const openChat = ref(false);
    const messages = ref([]);
    const newMessagesCount = ref(0);

    const getNewMessagesCount = computed(() => {
        return newMessagesCount.value;
    });

    const getOpenChat = computed(() => {
        return openChat.value;
    });

    function setOpenChat() {
        openChat.value = true;
    }

    // @ts-expect-error -- TS7006: Parameter 'message' implicitly has an 'any' type.
    function setMessage(message) {
        // @ts-expect-error -- TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
        messages.value.push(message);
        const lastOpen = localStorage.getItem("lastOpen");
        if (!lastOpen || message.timestamp > Number(lastOpen)) {
            newMessagesCount.value++;
        }
    }

    function resetMessageCount() {
        newMessagesCount.value = 0;
    }

    function setChatOpen() {
        newMessagesCount.value = 0;
        localStorage.setItem("lastOpen", String(Date.now()));
    }

    function resetOpenChat() {
        openChat.value = false;
    }

    return {
        getNewMessagesCount,
        getOpenChat,
        setOpenChat,
        setMessage,
        resetMessageCount,
        setChatOpen,
        resetOpenChat,
    };
});
