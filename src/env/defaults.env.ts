import { Models } from '$models';
import { secure } from './_keys.env';

export const env: Models.Env = {
  prod: false,
};

export const envDefaults = { ...secure, ...env };
