import dbClient from "./utils/db";
const Bull = require("bull");
const { ObjectId } = require("mongodb");
const imageThumbnail = require("image-thumbnail");
const fs = require("fs");

const fileQueue = new Bull("fileQueue");
const userQueue = new Bull("userQueue");

const createImageThumbnail = async (path, options) => {
  try {
    const thumbnail = await imageThumbnail(path, options);
    const pathNail = `${path}_${options.width}`;
    fs.writeFileSync(pathNail, thumbnail);
  } catch (error) {
    console.error(error);
  }
};

fileQueue.process(async (job) => {
  const { fileId } = job.data;
  if (!fileId) throw Error("Missing fileId");
  const { userId } = job.data;
  if (!userId) throw Error("Missing userId");
  const file = await dbClient.db
    .collection("files")
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!file) throw Error("File not found");
  createImageThumbnail(file.localPath, { width: 500 });
  createImageThumbnail(file.localPath, { width: 250 });
  createImageThumbnail(file.localPath, { width: 100 });
});

userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) throw Error("Missing userId");
  const user = await dbClient.findUserByID(userId);
  if (!user) throw Error("User not found");
  console.log(`Welcome ${user.email}`);
});
