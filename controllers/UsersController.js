import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await dbClient.findUser(email);
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const { _id } = await dbClient.createNewUser(email, password);
    res.status(201).json({ _id, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const id = await redisClient.getIdFromToken(token);
    const user = await dbClient.findUserByID(id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { _id, email } = user;
    return res.json({ id: _id, email });
  }
}

export default UsersController;
