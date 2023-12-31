import { MongoClient, ObjectId } from 'mongodb';
import { hashStr } from './helper-functions';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}`;
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.connected = false;
    this.client
      .connect()
      .then(() => {
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
      const user = await usersCollection.findOne({
        email,
        password: hashedPassword,
      });
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

  async findManyFilesByparentId(page, parentId) {
    await this.client.connect();
    const pageSize = 20;
    const skip = page * pageSize;
    const pipeline = [
      {
        $match: {
          parentId,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ];
    const db = this.client.db(this.database);
    const filesCollection = db.collection('files');
    const cursor = await filesCollection.aggregate(pipeline);
    const files = cursor.toArray();
    return files;
  }

  async findFileByID(id) {
    await this.client.connect();
    const db = this.client.db(this.database);
    const filesCollection = db.collection('files');
    const file = await filesCollection.findOne({ _id: ObjectId(id) });
    return file;
  }

  async updateIsPublic(userId, fileId, isPublic) {
    await this.client.connect();
    const db = this.client.db(this.database);
    const filesCollection = db.collection('files');
    const filter = { _id: ObjectId(fileId), userId: ObjectId(userId) };
    const update = { $set: { isPublic } };
    await filesCollection.updateOne(filter, update);
    const file = await filesCollection.findOne(filter);
    if (!file) return null;
    const { _id } = file;
    const tmpFile = { id: _id, ...file };
    delete tmpFile._id;
    delete tmpFile.localPath;
    return tmpFile;
  }

  async createNewUser(email, password) {
    const hashedPassword = hashStr(password);
    await this.client.connect();
    const db = this.client.db(this.database);
    const usersCollection = db.collection('users');
    const { ops } = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });
    return ops[0];
  }

  async addNewFile(
    userId,
    name,
    type,
    isPublic = false,
    parentId = 0,
    localPath,
  ) {
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
