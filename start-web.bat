@echo off
echo Starting Expo in offline mode...
set EXPO_OFFLINE=1
set EXPO_NO_TELEMETRY=1
set EXPO_NO_CACHE=1
npx expo start --web --offline --port 8081
pause