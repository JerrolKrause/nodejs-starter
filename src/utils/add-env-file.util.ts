import fs from 'fs';

/**
 * Check for the existence of a env file that will not be committed, create one if not
 */
export const addEnvFile = () => {
  const srcPath = 'src/env/_keys.env.ts';

  // Check for the existence of src/env/_keys.env.ts
  if (!fs.existsSync(srcPath)) {
    // Content for the new file
    const content = `import { Models } from '$models';

// Stuff you don't want in the repo.
export const secure: Models.Env = {};`;

    // Write the content to src/env/_keys.env.ts
    fs.writeFileSync(srcPath, content);
    console.log(`${srcPath} has been created with the default format.`);
  }
};
