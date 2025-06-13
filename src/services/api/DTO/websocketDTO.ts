export interface IToken {
    token: string
}

export interface IAuthData {
    channels: Array<{
        channel: string,
        token: string
    }>
}
