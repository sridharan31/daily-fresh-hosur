/**
 * Web-compatible ReactDevToolsSettingsManager for React Native
 */

const ReactDevToolsSettingsManager = {
  getConsolePatchSettings: () => Promise.resolve({}),
  setConsolePatchSettings: (settings) => Promise.resolve(),
  reload: () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
};

module.exports = ReactDevToolsSettingsManager;