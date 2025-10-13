// Main entry point for React Navigation app
import { registerRootComponent } from 'expo';
// Temporarily use AppSwitcher for testing
import AppSwitcher from './AppSwitcher';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AppSwitcher);