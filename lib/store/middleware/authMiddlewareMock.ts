// Mock auth middleware to replace Firebase-dependent version
import { createListenerMiddleware } from '@reduxjs/toolkit';

// Create a simple mock middleware that doesn't use Firebase
export const authMiddleware = createListenerMiddleware();

export default authMiddleware;