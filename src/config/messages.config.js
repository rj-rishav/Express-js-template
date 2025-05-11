const Token = {
  error: {
    MISSING_TOKEN: 'Token Secret Not Provoded',
  },
};

const Global = {
  success: {
    SERVER_BOOTING: '🚀 Booting the server',
    SERVER_BOOTED: '✨ Server started at port:',
    DB_CONNECTED: '📦 Data Source has been initialized!',
  },
  error: {
    INTERNAL_ERROR: 'Internal Server Error',
    SOMETHING_WRONG: 'Something went wrong',
    DB_CONNECTION_FAILED: '❌ Error during Data Source initialization:',
  },
};

const Auth = {
  success: {},
  error: {
    EMAIL_EXISTS: 'Email already in use',
    INVAILD_CREDS: 'Invalid credentials',
    MISSING_REFRESH_TOKEN: 'No refresh token provided',
  },
};

const User = {
  success: {},
  error: {
    USER_NOT_FOUND: 'User not found',
  },
};

const Messages = {
  Global,
  Token,
  Auth,
  User,
};

export default Messages;
