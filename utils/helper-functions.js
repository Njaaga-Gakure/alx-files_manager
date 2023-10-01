import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';

export const hashStr = (str) => sha1(str);
export const randomStr = () => uuidv4().toString();
