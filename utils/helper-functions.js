import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';

export const hashStr = (str) => sha1(str);
export const randomStr = () => uuidv4().toString();
export const saveToDisk = (folderPath, data) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }
  const filePath = path.join(folderPath, uuidv4());
  writeFileSync(filePath, Buffer.from(data, 'base64'));
  return filePath;
};

export const readFromDisk = (filePath) => {
  if (!existsSync(filePath)) {
    return null;
  }
  const fileData = readFileSync(filePath, 'base64');
  return Buffer.from(fileData, 'base64').toString();
} 
