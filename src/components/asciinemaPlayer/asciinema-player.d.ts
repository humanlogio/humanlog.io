declare module "asciinema-player" {
  export function create(
    src: string,
    element: HTMLElement,
    options?: Record<string, any>,
  ): void;
}
