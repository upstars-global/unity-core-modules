import { defineStore } from "pinia";
import { ref } from "vue";

import { bodyDisableScroll } from "../helpers/bodyDisableScroll";
import type { IModalOptions } from "../models/modalOptions";
import { EventBus as bus } from "../plugins/EventBus";

type IFormInputsData = Record<string, string>;

export function createUIStore(theme: string) {
    return defineStore("UI", () => {
        const showModal = ref<boolean>(false);
        const modals = ref<IModalOptions[]>([]);
        const formsInputs = ref<IFormInputsData>({
            login: "",
            password: "",
        });

        const colorTheme = ref<string>(theme);
        const isThemeDark = ref<boolean>(colorTheme.value === "theme-dark");

        function setShowModal(options: IModalOptions) {
            const modalIsOpen = modals.value.some((modal: IModalOptions) => {
                return modal.name === options.name;
            });

            if (!modalIsOpen) {
                showModal.value = true;
                modals.value.push(options);
                bodyDisableScroll(true);
            }
        }

        function closeModal({ name, immediate = false, ...args }) {
            const index = modals.value.findIndex((modal) => {
                return modal.name === name;
            });
            if (index >= 0) {
                modals.value.splice(index, 1);
            }

            if (modals.value.length === 0) {
                if (immediate) {
                    showModal.value = false;
                } else {
                    setTimeout(() => {
                        if (modals.value.length === 0) {
                            showModal.value = false;
                        }
                    }, 100);
                }
                bodyDisableScroll(false);
            }
            bus.$emit("modal.closed", name, { ...args });
        }

        function setNewDataToFormInputs(fieldData: IFormInputsData) {
            formsInputs.value = {
                ...formsInputs.value,
                ...fieldData,
            };
        }

        const getFormInputs = (key: string) => formsInputs.value[key];

        return {
            colorTheme,
            modals,
            showModal,

            isThemeDark,

            setShowModal,
            closeModal,
            setNewDataToFormInputs,

            getFormInputs,
        };
    });
}
