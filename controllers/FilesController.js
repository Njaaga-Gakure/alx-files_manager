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
      name, type, parentId, isPublic, data,
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
    const file = await dbClient.addNewFile(
      _id,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    );
    return res.status(201).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getShow(req, res) {
    const { id } = req.params;
    const token = req.headers['x-token'];
    const userId = await redisClient.getIdFromToken(token);
    const user = await dbClient.findUserByID(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const file = await dbClient.findFileByID(id);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.getIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { parentId, page } = req.query;
    const parsedPage = parseInt(page, 10) || 0;
    const itemsPerPage = 20;
    // aggregation pipeline for pagination
    const aggregationPipeline = [
      { $match: { userId, parentId: parentId || 0 } },
      { $skip: parsedPage * itemsPerPage },
      { $limit: itemsPerPage },
    ];
    // Get the list of file documents
    const filePages = await dbClient.aggregateFiles(aggregationPipeline);
    const files = [];
    await filePages.forEach((file) => {
      const fileObj = {
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      };
      files.push(fileObj);
    });
    return res.status(200).json(files);
  }
}

export default FilesController;
