interface IBus {
  $emit(event: string, ...args: unknown[]): void;
}
