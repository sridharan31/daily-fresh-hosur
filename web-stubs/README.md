# Web Stubs for React Native

This directory contains web-compatible implementations of React Native modules that don't have native web support.

## Purpose

When running React Native apps on the web platform, some native modules need to be stubbed out with web-compatible implementations. These stubs ensure the app can bundle and run properly in browsers.

## Structure

```
web-stubs/
├── react-native/
│   └── Libraries/
│       ├── Utilities/
│       │   ├── Platform.js                   # Platform detection for web
│       │   └── BackHandler.js                # Web back button handling
│       ├── StyleSheet/
│       │   └── PlatformColorValueTypes.js    # Color type definitions
│       ├── Components/
│       │   └── View/
│       │       └── BaseViewConfig.js         # Base view configuration
│       ├── ReactNative/
│       │   └── legacySendAccessibilityEvent.js # Accessibility events
│       ├── Core/
│       │   └── ReactDevToolsSettingsManager.js # Dev tools integration
│       ├── NativeModules/
│       │   └── RCTAlertManager.js            # Alert dialogs for web
│       ├── Network/
│       │   └── RCTNetworking.js              # Network requests via fetch
│       └── Image/
│           └── Image.js                      # Image component for web
└── [other native module stubs...]
```

## How It Works

The `metro.config.js` file is configured to resolve React Native core modules to these stubs when building for the web platform. This allows the same codebase to work across native and web platforms.

## Adding New Stubs

1. Create the stub file in the appropriate directory structure
2. Implement web-compatible functionality using browser APIs
3. Add the module alias to `metro.config.js`
4. Test the implementation

## Important Notes

- These stubs are version-controlled and will persist across npm installs
- Each stub should provide a web-compatible implementation using browser APIs
- Stubs should match the expected API of the original React Native modules
- Always test stubs thoroughly to ensure they work as expected on web