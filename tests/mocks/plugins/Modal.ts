// eslint-disable-next-line @typescript-eslint/init-declarations
let bus: IBus | undefined;

const Modal = {
    init($bus: IBus) {
        bus = $bus;
    },

    show(options: object) {
        bus?.$emit("modal.show", options);
    },

    close(options: string) {
        bus?.$emit("modal.close", options);
    },
};

export default Modal;
