import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 API server running on http://localhost:${env.PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  
  // Security warning for mock auth
  if (env.ENABLE_MOCK_AUTH) {
    console.warn('⚠️  [SECURITY WARNING] Mock authentication is enabled!');
    console.warn('⚠️  This should NEVER be enabled in production.');
  }
});
