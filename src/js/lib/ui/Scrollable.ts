export interface Scrollable {
  onHScroll(source: Scrollable, offset: number, limit: number, count: number): void;
  onVScroll(source: Scrollable, offset: number, limit: number, count: number): void;
  onTScroll(
    source: Scrollable,
    current: number,
    offset: number,
    limit: number,
    count: number
  ): void;
  fireHScroll(): void;
  fireVScroll(): void;
  fireTScroll(): void;
}
