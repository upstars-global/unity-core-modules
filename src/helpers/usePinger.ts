export class UsePing {
    timer: number;
    timerID: ReturnType<typeof setTimeout> | null = null;
    funcToCall: () => void;
    // @ts-expect-error Parameter 'funcToCall' implicitly has an 'any' type.
    constructor(funcToCall, timer = 10000) {
        this.timer = timer;
        this.funcToCall = funcToCall;
    }

    async runPing(): Promise<ReturnType<typeof setTimeout>> {
        this.clearPing();

        await this.funcToCall();
        this.timerID = setTimeout(async() => {
            this.timerID = await this.runPing();
        }, this.timer);
        return this.timerID;
    }

    clearPing(): void {
        if (this.timerID) {
            clearTimeout(this.timerID);
        }
    }
}
