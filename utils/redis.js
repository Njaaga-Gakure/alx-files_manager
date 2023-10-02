import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.connected = false;
    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
      this.connected = true;
    })
      .on('error', (err) => {
        console.log(`Redis client not connected to the server: ${err}`);
      });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    const value = await getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    try {
      const setAsync = promisify(this.client.set).bind(this.client);
      const expireAsync = promisify(this.client.expire).bind(this.client);
      await setAsync(key, value);
      await expireAsync(key, duration);
    } catch (err) {
      console.log(err);
    }
  }

  async del(key) {
    try {
      const delAsync = promisify(this.client.del).bind(this.client);
      const deleteCount = delAsync(key);
      if (deleteCount === 1) {
        console.log(`${key} deleted successfully`);
      } else {
        console.log(`${key} not found`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getIdFromToken(token) {
    const key = `auth_${token}`;
    const id = await this.get(key);
    return id;
  }
}

const redisClient = new RedisClient();
export default redisClient;
