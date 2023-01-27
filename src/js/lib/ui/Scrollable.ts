export interface Scrollable {
  onHScroll(source: Scrollable, offset: number, limit: number, count: number): void;
  onVScroll(source: Scrollable, offset: number, limit: number, count: number): void;
  fireHScroll(): void;
  fireVScroll(): void;
}
