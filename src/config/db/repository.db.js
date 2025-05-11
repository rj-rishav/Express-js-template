import { AppDataSource } from './connection.db.js';

import UserSchema from '../../models/user.model.js';

class Repository {
  static User = AppDataSource.getRepository(UserSchema);
}

export default Repository;
