import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { saveToDisk } from '../utils/helper-functions';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const id = await redisClient.getIdFromToken(token);
    const user = await dbClient.findUserByID(id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const {
      name,
      type,
      parentId,
      isPublic,
      data,
    } = req.body;
    const typeList = ['folder', 'file', 'image'];
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !typeList.includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
    if (parentId) {
      const file = await dbClient.findFileByparentId(parentId);
      if (!file) return res.status(400).json({ error: 'Parent not found' });
      const { type } = file;
      if (type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }
    const { _id } = user;
    let folderPath;
    let localPath;
    if (type !== 'folder') {
      folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      localPath = saveToDisk(folderPath, data);
    }
    const file = await dbClient.addNewFile(_id, name, type, isPublic, parentId, localPath);
    return res.status(201).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }
}

export default FilesController;
