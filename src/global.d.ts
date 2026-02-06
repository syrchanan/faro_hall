declare module 'jest-axe' {
  export function axe(node: any): Promise<any>;
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}

export {};
