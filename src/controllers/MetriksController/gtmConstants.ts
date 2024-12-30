export const PLACES = {
    DEFAULT: "default",
    IN_GAME: "inGame",
};
export const COMMON_EVENT = "rocketplay";

export const REGISTRATION_EVENTS = {
    SIGNUP: {
        FIRST_SIGNUP_CLICK: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "firstSignupClick",
            eventPlace: PLACES.DEFAULT,
        },
        POP_UP: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        POP_UP_NEW: {
            event: "sign_up_popup_view",
            eventAction: "step1",
            eventCategory: "SIGNUP",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        EMAIL_CHECKBOX_BOX: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "emailCheckBox",
            eventPlace: PLACES.DEFAULT,
        },
        EMAIL_CHECKBOX_BOX_NEW: {
            event: "sign_up_account_info",
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "emailCheckBox",
            eventPlace: PLACES.DEFAULT,

        },
        PASSWORD_CHECKBOX_BOX: {
            event: "sign_up_account_info",
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "passwordCheckBox",
            eventPlace: PLACES.DEFAULT,
        },
        PASSWORD_CHECKBOX_BOX_NEW: {
            event: "sign_up_account_info",
            eventAction: "step1",
            eventCategory: "SIGNUP",
            eventLabel: "passwordCheckBox",
            eventPlace: PLACES.DEFAULT,

        },
        COUNTRY_NEW: {
            event: "sign_up_account_info",
            eventAction: "step1",
            eventCategory: "SIGNUP",
            eventLabel: "country",
            eventPlace: PLACES.DEFAULT,
        },
        CURRENCY_CHOISE: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "сurrencyChoice",
            eventPlace: PLACES.DEFAULT,
        },

        CURRENCY_CHOISE_NEW: {
            event: "sign_up_currency",
            eventAction: "step1",
            eventCategory: "SIGNUP",
            eventLabel: "сurrencyChoice",
            reg_currency: "",
        },
        RECEIVE_EMAIL_PROMOS_OFF_NEW: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "receiveEmailPromosOff",
            eventPlace: PLACES.DEFAULT,
        },
        RECEIVE_EMAIL_PROMOS_ON_NEW: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "receiveEmailPromosOn",
            eventPlace: PLACES.DEFAULT,
        },
        RECEIVE_EMAIL_PROMOS_OFF: {
            event: "sign_up_account_info",
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "receiveEmailPromosOff",
            eventPlace: PLACES.DEFAULT,
        },
        RECEIVE_EMAIL_PROMOS_ON: {
            event: "sign_up_account_info",
            eventAction: "step1",
            eventCategory: "SIGNUP",
            eventLabel: "receiveEmailPromosOn",
            eventPlace: PLACES.DEFAULT,
        },
        SIGNED: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step1",
            eventLabel: "signed",
            eventPlace: PLACES.DEFAULT,
        },
        SIGNED_NEW: {
            event: "sign_up_account_info",
            eventAction: "step1",
            eventCategory: "SIGNUP",
            eventLabel: "signed",
            eventPlace: PLACES.DEFAULT,

        },
        SIGNUP_ERROR: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUPError",
            eventAction: "step1",
            eventLabel: "email",
            eventPlace: PLACES.DEFAULT,
        },
        STEP_1_SUCCESS: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "step1Success",
            eventPlace: PLACES.DEFAULT,

        },


        // STEP2
        FIRST_NAME: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "firstName",
            eventPlace: PLACES.DEFAULT,
        },
        FIRST_NAME_NEW: {
            event: "sign_up_personal_info",
            eventAction: "step3",
            eventCategory: "SIGNUP",
            eventLabel: "firstName",
        },
        LAST_NAME: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "lastName",
            eventPlace: PLACES.DEFAULT,
        },
        LAST_NAME_NEW: {
            event: "sign_up_personal_info",
            eventAction: "step3",
            eventCategory: "SIGNUP",
            eventLabel: "lastName",
        },
        PHONE: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "phone",
            eventPlace: PLACES.DEFAULT,
        },
        PHONE_NEW: {
            event: "sign_up_personal_info",
            eventAction: "step3",
            eventCategory: "SIGNUP",
            eventLabel: "phone",
        },
        BIRTH_DAY: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "YYYY-MM-DD",
            eventPlace: PLACES.DEFAULT,
        },
        DD: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "dd",
            eventPlace: PLACES.DEFAULT,
        },
        MM: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "mm",
            eventPlace: PLACES.DEFAULT,
        },
        YYYY: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step2",
            eventLabel: "yyyy",
            eventPlace: PLACES.DEFAULT,
        },

        DD_NEW: {
            event: "sign_up_personal_info",
            eventAction: "step3",
            eventCategory: "SIGNUP",
            eventLabel: "dd",
        },
        MM_NEW: {
            event: "sign_up_personal_info",
            eventAction: "step3",
            eventCategory: "SIGNUP",
            eventLabel: "mm",
        },
        YYYY_NEW: {
            event: "sign_up_personal_info",
            eventAction: "step3",
            eventCategory: "SIGNUP",
            eventLabel: "yyyy",
        },
        STEP_2_SUCCESS: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "step2Success",
            eventPlace: PLACES.DEFAULT,
        },

        // STEP_3
        STEP_3_SUCCESS_NEW: {
            event: "sign_up_2_step_success",
            eventAction: "step3",
            eventCategory: "SIGNUP",
            eventLabel: "step2Success",
        },
        COUNTRY: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "country",
            eventPlace: PLACES.DEFAULT,
        },
        CITY: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "city",
            eventPlace: PLACES.DEFAULT,
        },
        CITY_NEW: {
            event: "sign_up_address_info",
            eventAction: "step4",
            eventCategory: "SIGNUP",
            eventLabel: "city",
        },
        ADDRESS: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "address",
            eventPlace: PLACES.DEFAULT,
        },
        ADDRESS_NEW: {
            event: "sign_up_address_info",
            eventAction: "step4",
            eventCategory: "SIGNUP",
            eventLabel: "address",
        },
        POSTAL_CODE: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "postalCode",
            eventPlace: PLACES.DEFAULT,
        },
        POSTAL_CODE_NEW: {
            event: "sign_up_address_info",
            eventAction: "step4",
            eventCategory: "SIGNUP",
            eventLabel: "postalCode",
        },
        STEP_3_SUCCESS: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "step3Success",
            eventPlace: PLACES.DEFAULT,
        },
        GOT_IT: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "gotIt",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_NOW: {
            event: COMMON_EVENT,
            eventCategory: "SIGNUP",
            eventAction: "step3",
            eventLabel: "thankForReg",
            eventContent: "Deposit Now",
            eventPlace: PLACES.DEFAULT,
        },

        STEP_4: {
            SUCCESS_ENTERED: {
                event: "sign_up_3_step_success",
                eventAction: "step4",
                eventCategory: "SIGNUP",
                eventLabel: "step3Success",
            },
        },

        CLICK_CLOSE: {
            event: "sign_up_close_popup",
            eventAction: "close",
            eventCategory: "SIGNUP",
            eventLabel: "",
        },
        SIGN_UP_SUCCESS: {
            event: "sign_up_success",
            eventAction: "",
            eventCategory: "SIGNUP",
            eventLabel: "",
            userId: "",
            Currency: "",
            currencyCode: "",
            Country: "",
            userAuth: "",
            Affiliate: "",
            Platform: "",

        },
    },

    CLICK: {
        event: "sign_up_click",
        eventAction: "step1",
        eventCategory: "SIGNUP",
        eventLabel: "firstSignupClick",
        location: "front not set",
    },

    VALIDATION_ERRORS: {
        MAIN_DATA: {
            event: "sign_up_error",
            eventAction: "step1",
            eventCategory: "SIGNUPError",
            eventLabel: "", // Передавать соответственно email / password/signed в зависимости от типа ошибки
            eventContent: "", // Передавать полный текст ошибки
        },

    },
};
export const PERSONAL_INFO_POPUP = {
    VALIDATION_ERRORS: {
        event: "sign_up_personal_info",
        eventAction: "step1",
        eventCategory: "SIGNUP",
    },
    ADRESS_SUCCESS: {
        event: "sign_up_3_step_success",
        eventAction: "step4",
        eventCategory: "SIGNUP",
        eventLabel: "step3Success",

    },
};

export const GAME_EVENTS = {
    DEMO: {
        event: "demo_click",
    },
    REAL: {
        event: "real_click",
    },
};

export const CASHBOX_EVENTS = {
    DEPOSIT: {
        DEPOSIT_MAIN: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "depositMain",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_CASHBOX: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "depositCashbox",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_POP_UP_STEP_1: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        ENTER_THE_AMOUNT: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "enterTheAmount",
            eventPlace: PLACES.DEFAULT,
        },
        CURRENCY_CHOICE: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "currencyChoice",
            eventPlace: PLACES.DEFAULT,
        },
        USE_BONUSES_ON: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "useBonusesOn",
            eventPlace: PLACES.DEFAULT,
        },
        USE_BONUSES_OFF: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "useBonusesOff",
            eventPlace: PLACES.DEFAULT,
        },
        ENTER_PROMO_CODE: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "enterPromoCode",
            eventPlace: PLACES.DEFAULT,
        },
        PROMO_CODE_ADDED: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step1",
            eventLabel: "promoCodeAdded",
            eventPlace: PLACES.DEFAULT,
        },
        // STEP2
        DEPOSIT_POP_UP_STEP_2: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step2",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        CHOOSE_METHOD: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step2",
            eventLabel: "payment",
            eventPlace: PLACES.DEFAULT,
        },
        // STEP3
        DEPOSIT_POP_UP_STEP_3: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step3",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        CHECK_BOX: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step3",
            eventLabel: "checkBox",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_BUTTON: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step3",
            eventLabel: "depositButton",
            eventPlace: PLACES.DEFAULT,
        },
        DELETE_SAVED_METHOD: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "step3",
            eventLabel: "deleteSavedMethod",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_SUCCESS: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "success",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_UNSUCCESS: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "unsuccess",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_CLOSE: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT",
            eventAction: "close",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },
        CASHBOX_CLICK_ON_MENU: {
            event: COMMON_EVENT,
            eventAction: "step1",
            eventCategory: "DEPOSIT",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },
        BACK_TO_FLOW: {
            event: COMMON_EVENT,
            eventAction: "step2",
            eventCategory: "DEPOSIT",
            eventLabel: "backToFlow",
            eventPlace: PLACES.DEFAULT,
        },
        CLICK_ON_PICK: {
            event: COMMON_EVENT,
            eventAction: "step1",
            eventCategory: "DEPOSIT",
            eventLabel: "clickOnPick",
            eventPlace: PLACES.DEFAULT,
        },

        NEW: {
            CLICK_OPEN_DEPOSIT_MAIN: {
                event: "deposit_click",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "depositMain",
                location: "",
            },
            POPUP_OPENED: {
                event: "deposit_popup_view",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "popUp",
            },
            ENTER_THE_AMOUNT: {
                event: "deposit_amount",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "enterTheAmount",
            },
            AMOUNT_CHANGE_CURRENCY: {
                event: "deposit_amount",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "currencyChoice",
                dep_currency: "",
            },
            USE_BONUSES: {
                event: "deposit_amount",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "", // useBonusesOff || useBonusesOn
            },
            ENTER_PROMO_CODE: {
                event: "deposit_amount",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "enterPromoCode",
            },
            PROMO_CODE_ADDED: {
                event: "deposit_amount",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "promoCodeAdded",
                dep_promocode: "", // передаем промокод
            },
            LOTTERY_TICKET_REC_CHOSEN: {
                event: "deposit_amount",
                eventAction: "step1",
                eventCategory: "DEPOSIT",
                eventLabel: "lotteryTicket",
                dep_ticket: "",
            },
            POPUP_STEP_2: {
                event: "deposit_1_step_success",
                eventAction: "step2",
                eventCategory: "DEPOSIT",
                eventLabel: "popUp",
            },
            CHOOSE_METHOD: {
                event: "deposit_payment_method",
                eventAction: "step2",
                eventCategory: "DEPOSIT",
                eventLabel: "", // payment - признак оплаты, Visa -  метод оплаты
                eventContent: "", //  Статус выбранного метода оплаты: visaSaved /visaNotsaved
                payment_option: "", // передаем выбранный метод оплаты
            },

            POPUP_STEP_3: {
                event: "deposit_2_step_success",
                eventAction: "step3",
                eventCategory: "DEPOSIT",
                eventLabel: "popUp",
            },

            CHANGE_FORM_FIELD: {
                event: "deposit_payment_info",
                eventAction: "step3",
                eventCategory: "DEPOSIT",
                eventLabel: "", // передаем название поля
                payment_option: "", // передаем выбранный метод оплаты
            },
            DEPOSIT_BUTTON: {
                event: "deposit_success",
                eventAction: "step3",
                eventCategory: "DEPOSIT",
                eventLabel: "depositButton",
                payment_option: "", // передаем выбранный метод оплаты
            },
            CLOSE_POPUP: {
                event: "deposit_close_popup",
                eventAction: "close",
                eventCategory: "DEPOSIT",
                eventLabel: "", // шаг на котором закрыли popUp соответственно: step1/step2/step3
            },
        },
        FORM: {
            PERSONAL_INFO: {
                event: "sign_up_personal_info",
                eventAction: "step3",
                eventCategory: "DEPOSIT",
                eventLabel: "", // Передавать соответственно  firstName / lastName / phone / dd / mm / yyyy
            },
            ADDRESS_INFO: {
                event: "sign_up_address_info",
                eventAction: "step4",
                eventCategory: "DEPOSIT",
                eventLabel: "", // Передаем city / address / postalCode
            },
            DEPOSIT_BUTTON: {
                event: "deposit_success",
                eventAction: "step3",
                eventCategory: "DEPOSIT",
                eventLabel: "depositButton",
                payment_option: "", // передаем выбранный метод оплаты
            },
        },
    },
    WITHDRAW: {
        DEPOSIT_CASHBOX: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step1",
            eventLabel: "depositCashbox",
            eventPlace: PLACES.DEFAULT,
        },
        POP_UP_STEP_1: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step1",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        ENTER_THE_AMOUNT: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step1",
            eventLabel: "enterTheAmount",
            eventPlace: PLACES.DEFAULT,
        },
        CURRENCY_CHOICE: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step1",
            eventLabel: "currencyChoice",
            eventPlace: PLACES.DEFAULT,
        },
        // STEP2
        POP_UP_STEP_2: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step2",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        CHOOSE_METHOD: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step2",
            eventLabel: "payment",
            eventPlace: PLACES.DEFAULT,
        },
        // STEP3
        POP_UP_STEP_3: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step3",
            eventLabel: "popUp",
            eventPlace: PLACES.DEFAULT,
        },
        WITHDRAW_SUCCESS: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "success",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },
        WITHDRAW_UNSUCCESS: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "unsuccess",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },
        GO_TO_GAMES: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "step3",
            eventLabel: "goToGames",
            eventPlace: PLACES.DEFAULT,
        },
        WITHDRAW_CLOSE: {
            event: COMMON_EVENT,
            eventCategory: "WITHDRAW",
            eventAction: "close",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },

        NEW: {
            CLICK_BUTTON_OPEN_POPUP: {
                event: "withdraw_click",
                eventAction: "step1",
                eventCategory: "WITHDRAW",
                eventLabel: "depositCashbox",
                location: "", // передаем локацию кнопки
            },
            STEP_1_OPENED: {
                event: "withdraw_popup_view",
                eventAction: "step1",
                eventCategory: "WITHDRAW",
                eventLabel: "popUp",
            },
            ENTER_AMOUNT: {
                event: "withdraw_amount",
                eventAction: "step1",
                eventCategory: "WITHDRAW",
                eventLabel: "enterTheAmount",
            },
            STEP_2_OPENED: {
                event: "withdraw_1_step_success",
                eventAction: "step2",
                eventCategory: "WITHDRAW",
                eventLabel: "popUp",
            },
            STEP_2_SELECT_METHOD: {
                event: "withdraw_payment_method",
                eventAction: "step2",
                eventCategory: "WITHDRAW",
                eventLabel: "", // payment - признак оплаты, Bitcoin -  метод оплаты
                eventContent: "", //  Статус выбранного метода оплаты: bitcoinSaved /bitcoinNotsaved
                payment_option: "", // выбранный метод оплаты
            },
            STEP_3_OPENED: {
                event: "withdraw_2_step_success",
                eventAction: "step3",
                eventCategory: "WITHDRAW",
                eventLabel: "popUp",
            },
            CHANGE_FORM_FIELD: {
                event: "withdraw_payment_info",
                eventAction: "step3",
                eventCategory: "WITHDRAW",
                eventLabel: "", // передаем название поля
                payment_option: "", // выбранный метод оплаты
            },
            WITHDRAW_SUCCESS: {
                event: "withdraw_success", // или withdraw_unsuccess
                eventAction: "success", // Необходимо статус депозита: success/Unsuccess
                eventCategory: "WITHDRAW",
                eventLabel: "", // Необходимо передавать метод оплаты
            },

            WITHDRAW_UNSUCCESS: {
                event: "withdraw_unsuccess", // или withdraw_unsuccess
                eventAction: "unsuccess", // Необходимо статус депозита: success/Unsuccess
                eventCategory: "WITHDRAW",
                eventLabel: "", // Необходимо передавать метод оплаты
            },

            CLOSE_POPUP: {
                event: "withdraw_close_popup",
                eventAction: "close",
                eventCategory: "WITHDRAW",
                eventLabel: "", // шаг на котором закрыли popUp соответственно: step1/step2/step3
            },
        },
    },
    DEPOSIT_UTORG: {
        DEPOSIT_MAIN: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "step1",
            eventLabel: "depositMainUtorg",
            eventPlace: PLACES.DEFAULT,
        },
        DEPOSIT_CLOSE: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "close",
            eventLabel: "not set",
            eventPlace: PLACES.DEFAULT,
        },
        ENTER_THE_AMOUNT: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "step1",
            eventLabel: "enterTheAmount",
            eventPlace: PLACES.DEFAULT,
        },
        CURRENCY_CHOICE: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "step1",
            eventLabel: "currencyChoice",
            eventPlace: PLACES.DEFAULT,
        },
        ENTER_PROMO_CODE: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "step1",
            eventLabel: "enterPromoCode",
            eventPlace: PLACES.DEFAULT,
        },
        PROMO_CODE_ADDED: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "step1",
            eventLabel: "promoCodeAdded",
            eventPlace: PLACES.DEFAULT,
        },
        USE_BONUSES_ON: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "step1",
            eventLabel: "useBonusesOn",
            eventPlace: PLACES.DEFAULT,
        },
        USE_BONUSES_OFF: {
            event: COMMON_EVENT,
            eventCategory: "DEPOSIT_UTORG",
            eventAction: "step1",
            eventLabel: "useBonusesOff",
            eventPlace: PLACES.DEFAULT,
        },
    },
    PRE_CASHBOX_PROFILE_SETTINGS: {
        OPEN: {
            event: "sign_up_complete_profile_popup_view",
        },
    },
};
export const LOGIN_EVENTS = {
    CLICK_ON_BUTTON_LOGIN: {
        event: "log_in_click",
        eventAction: "step1",
        eventCategory: "LOGIN",
        eventLabel: "firstSignupClick",
        location: "", // передаем локацию кнопки
    },

    POPUP: {
        OPEN: {
            event: "log_in_popup_view",
            eventAction: "step1",
            eventCategory: "LOGIN",
            eventLabel: "popUp",
        },
        CHANGE_FIELD: {
            EMAIL: {
                event: "log_in_fill_form",
                eventAction: "step2",
                eventCategory: "LOGIN",
                eventLabel: "email",
            },
            PASSWORD: {
                event: "log_in_fill_form",
                eventAction: "step2",
                eventCategory: "LOGIN",
                eventLabel: "password",
            },
        },
        CLICK: {
            FORGOT_PASS: {
                event: "log_in_forgot_pass",
                eventAction: "step2",
                eventCategory: "LOGIN",
                eventLabel: "forgotYourPass",
            },
        },
        FORM: {
            SUBMIT: {
                event: "log_in_form_button",
                eventAction: "step2",
                eventCategory: "LOGIN",
                eventLabel: "loginButton",
            },
            HAS_ERROR: {
                event: "log_in_error",
                eventAction: "step2",
                eventCategory: "LOGINError",
                eventLabel: "", // Передавать соответственно поле
                eventContent: "", // Передавать полный текст ошибки
            },

            LOGIN_SUCCESS: {
                event: "log_in_success",
                eventAction: "step2",
                eventCategory: "LOGIN",
                eventLabel: "loginSuccess",
                userId: "", // передаем user_id
                Currency: "", // передаем аналогично https://prnt.sc/26ndbdg
                currencyCode: "",
                Country: "",
                userAuth: "true",
                Affiliate: "",
                Platform: "", // mobile, web, pwa, android-app, ios-app
            },
        },
    },

};
export const COMMON_EVENTS = {
    BANNERS: {
        event: "banner_button",
        button_text: "",
        button_url: "",
    },
    RANDOM_CARD: {
        event: "pick_a_game",
        category: "", // передаем категорию - slots | top | live и тд
    },
    ACHIEVEMENT_ACTION: {
        event: "play_achievement",
        achievement: "", // передаем название ачивки

    },
};
export const LOOTBOX_WHEEL = {
    CLICK_ON_USE_PROMOCODE: {
        event: "use_promocode_to_spin",
        userId: null,
    },
    CLICK_ON_SPIN_WHEEL: {
        event: "spin_the_wheel",
        userId: null,
    },
};
export const FORM_EVENTS = {
    VALIDATION_ERRORS: {
        EMAIL: {
            event: "email_error_validation",
            category: "", // категория валидации, например SIGNUP
            value: "", // текст поля email
            error: "", // текст ошибки валидации
        },
    },
};
