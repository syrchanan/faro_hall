import '@testing-library/jest-dom';
try { const { toHaveNoViolations } = require('jest-axe'); if (toHaveNoViolations && (expect as any).extend) { (expect as any).extend({ toHaveNoViolations }); } } catch (e) { /* jest-axe not installed; matcher shim may be present via types */ }
