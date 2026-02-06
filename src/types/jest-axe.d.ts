// Local declaration for jest-axe to satisfy TypeScript and tests
import 'jest';

declare module 'jest-axe' {
  export interface AxeResults { [key: string]: any }
  export function axe(node?: HTMLElement | Document, options?: any): Promise<AxeResults>;
  export function toHaveNoViolations(results: AxeResults): any;
  const _default: any;
  export default _default;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}
