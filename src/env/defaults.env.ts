import { Models } from '$models';
import { secure } from './_keys.env';

export const envDefaults: Models.Env = {
  ...secure,
};
