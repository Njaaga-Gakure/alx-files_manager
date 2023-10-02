/* eslint-disable linebreak-style */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { randomStr } from '../utils/helper-functions';

class AuthController {
  static async getConnect(req, res) {
    const { authorization } = req.headers;
    const base64Str = authorization.split(' ')[1];
    const decodedData = Buffer.from(base64Str, 'base64').toString('utf-8');
    const [email, password] = decodedData.split(':');
    const user = await dbClient.findUser(email, password);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const token = randomStr();
    const key = `auth_${token}`;
    const { _id } = user;
    await redisClient.set(key, _id, 86400);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const key = `auth_${token}`;
    const id = await redisClient.getIdFromToken(token);
    const user = await dbClient.findUserByID(id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(key);
    return res.status(204).end();
  }
}

export default AuthController;
