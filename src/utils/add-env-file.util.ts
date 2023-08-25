import fs from 'fs';

/**
 * Check for the existence of a env file that will not be committed, create one if not
 */
export const initializeFiles = () => {
  const files = [
    {
      path: 'src/env/.env.development',
      content: `# Environment (production or development)
NODE_ENV=dev

# Connection Strings
DB_CONNECTION_STRING=your-connection-string

# API Keys`,
    },
    {
      path: 'src/env/.env.production',
      content: `# Environment (production or development)
NODE_ENV=prod

# Connection Strings
DB_CONNECTION_STRING=your-connection-string

# API Keys`,
    },
  ];

  files.forEach(f => {
    const srcPath = f.path;

    // Check for the existence of src/env/_keys.env.ts
    if (!fs.existsSync(srcPath)) {
      // Content for the new file
      const content = f.content;

      // Write the content to src/env/_keys.env.ts
      fs.writeFileSync(srcPath, content);
      console.log(`${srcPath} is missing and has been created with the default format.`);
    }
  });
};
