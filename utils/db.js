import { MongoClient, ObjectId } from 'mongodb';
import { hashStr } from './helper-functions';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}`;
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.connected = false;
    this.client.connect().then(() => {
      this.connected = true;
    })
      .catch((err) => console.log(err));
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    await this.client.connect();
    const db = this.client.db(this.database);
    const usersCollection = db.collection('users');
    const noOfUsers = await usersCollection.countDocuments();
    return noOfUsers;
  }

  async nbFiles() {
    await this.client.connect();
    const db = this.client.db(this.database);
    const filesCollection = db.collection('files');
    const noOfFiles = await filesCollection.countDocuments();
    return noOfFiles;
  }

  async findUser(email, password) {
    await this.client.connect();
    const db = this.client.db(this.database);
    const usersCollection = db.collection('users');
    if (password) {
      const hashedPassword = hashStr(password);
      const user = await usersCollection.findOne({ email, password: hashedPassword });
      return user;
    }
    const user = await usersCollection.findOne({ email });
    return user;
  }

  async findUserByID(id) {
    await this.client.connect();
    const db = this.client.db(this.database);
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: ObjectId(id) });
    return user;
  }

  async findFileByparentId(parentId) {
    await this.client.connect();
    const db = this.client.db(this.database);
    const filesCollection = db.collection('files');
    const file = await filesCollection.findOne({ parentId });
    return file;
  }

  async createNewUser(email, password) {
    const hashedPassword = hashStr(password);
    await this.client.connect();
    const db = this.client.db(this.database);
    const usersCollection = db.collection('users');
    const { ops } = await usersCollection.insertOne({ email, password: hashedPassword });
    return ops[0];
  }

  async addNewFile(userId, name, type, isPublic = false, parentId = 0, localPath) {
    this.client.connect();
    const db = this.client.db(this.database);
    const filesCollection = db.collection('files');
    if (type === 'folder') {
      const { ops } = await filesCollection.insertOne({
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
      return ops[0];
    }
    const { ops } = await filesCollection.insertOne({
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    });
    return ops[0];
  }
}

const dbClient = new DBClient();
export default dbClient;
