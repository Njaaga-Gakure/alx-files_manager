import { MongoClient } from 'mongodb';

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
}

const dbClient = new DBClient();
export default dbClient;
