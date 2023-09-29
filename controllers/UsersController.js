import dbClient from '../utils/db';

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
      res.status(400).json({ error: 'Already exist'});
      return;
    }
    const { _id } = await dbClient.createNewUser(email, password);
    res.status(201).json({ _id, email });
  }
}

export default UsersController;
