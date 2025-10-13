// web-stubs/codegenNativeCommands.js

// Stub for react-native/Libraries/Utilities/codegenNativeCommands
const codegenNativeCommands = (config) => {
  const commands = {};
  
  if (config && config.supportedCommands) {
    config.supportedCommands.forEach(commandName => {
      commands[commandName] = () => {
        console.log(`[Web Stub] ${commandName} called`);
      };
    });
  }
  
  return commands;
};

export default codegenNativeCommands;
export { codegenNativeCommands };
