import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { spawn } from 'child_process';

dotenv.config();

const [FUNCTION_NAME] = process.argv.slice(2); // The name of the function in camelCase

const {
  MONGO_URL,
  NPM_AUTH_TOKEN,
} = process.env;

const kebabCase = () => FUNCTION_NAME.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

const buildPackageJson = () => (JSON.stringify({
  name: kebabCase(),
  version: '0.0.1',
  scripts: {
    'copy-configs': 'cp -rf package.json .npmrc lib',
    compile: 'tsc && npm run copy-configs'
  },
  dependencies: {
    'typescript': '^3.6.3'
  },
  devDependencies: {
    '@types/express': '^4.17.1',
    '@types/node': '^12.7.5',
    '@types/mongoose': '^5.5.6'
  }  
}, null, 2));

const tsConfig = () => (JSON.stringify({
  compilerOptions: {
    outDir: './lib',
    module: 'commonjs',
    target: 'es6',
    sourceMap: true,
    allowJs: true,
    moduleResolution: 'node',
    rootDir: '.',
    experimentalDecorators: true,
    forceConsistentCasingInFileNames: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noImplicitAny: true,
    strictNullChecks: true,
    suppressImplicitAnyIndexErrors: true,
    noUnusedLocals: true,
    esModuleInterop: true
  },
  lib: ['es2015']
}, null, 2));

const npmRC = () => `//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}`;
const dotEnv = () => `MONGO_URL=${MONGO_URL}`;

const indexFile = () => (
`import { IActionResponse, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const ${FUNCTION_NAME} = async (req: Request, res: Response) => {
  const response: IActionResponse = {
    result: 'success',
    details: '',
  };

  try {
    return res.json({ placeholder: \`hello this is ${FUNCTION_NAME}\` });
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'placeholder';

    return res.json(response);
  }  
};

export {
  ${FUNCTION_NAME},
};
`
);

(async () => {
  const ROOT_PATH = path.join(__dirname, `/functions/${FUNCTION_NAME}`);
  await promisify(fs.mkdir)(ROOT_PATH);
  const writeFilePromises = [
    promisify(fs.writeFile)(`${ROOT_PATH}/package.json`, buildPackageJson()),
    promisify(fs.writeFile)(`${ROOT_PATH}/tsconfig.json`, tsConfig()),
    promisify(fs.writeFile)(`${ROOT_PATH}/.npmrc`, npmRC()),
    promisify(fs.writeFile)(`${ROOT_PATH}/.env`, dotEnv()),
    promisify(fs.writeFile)(`${ROOT_PATH}/index.ts`, indexFile()),
  ];

  await Promise.all(writeFilePromises);

  const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm'

  spawn(npmCmd, ['i'], { env: process.env, cwd: `functions/${FUNCTION_NAME}`, stdio: 'inherit' })
})();


