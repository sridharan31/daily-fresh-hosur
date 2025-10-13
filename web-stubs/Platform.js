/**
 * Platform stub for web compatibility
 */

// Platform detection for web
const Platform = {
  OS: typeof window !== 'undefined' ? 'web' : 'native',
  select: (specifics) => {
    if (typeof window !== 'undefined') {
      return specifics.web || specifics.default;
    }
    return specifics.native || specifics.default;
  },
  isPad: false,
  isTVOS: false,
  isTV: false,
  Version: 0,
};

export { Platform };
export default Platform;