// models/RouteOptions.ts
export interface RouteOptions<T> {
  path: string;
  dataFileName: string;
  defaultData: T[];
}

// createRoute.ts
import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * TODO: Needs further testing
 * Create a REST api store that uses JSON and the filesystem instead of a databases
 * @param options
 * @returns
 */
export const createFileSystemApi = <T extends { id?: string }>(options: RouteOptions<T>): Router => {
  const router = Router();
  const dataPath = path.join(__dirname, options.dataFileName);
  let dataInMemory: T[] = options.defaultData;

  const readDataFromFile = (): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (dataInMemory.length > 0) {
        resolve(dataInMemory);
      } else {
        fs.readFile(dataPath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
          } else {
            dataInMemory = JSON.parse(data || '[]');
            resolve(dataInMemory);
          }
        });
      }
    });
  };

  const writeDataToFile = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.writeFile(dataPath, JSON.stringify(dataInMemory, null, 2), 'utf8', err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  router.get('/', (_req, res) => {
    readDataFromFile()
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ message: 'Error reading data', error: err }));
  });

  router.post('/', (req, res) => {
    readDataFromFile()
      .then(data => {
        const newItem: T = { id: uuidv4(), ...req.body };
        data.push(newItem);
        dataInMemory = data;
        return writeDataToFile();
      })
      .then(() => res.status(201).json({ message: 'Item created successfully' }))
      .catch(err => res.status(500).json({ message: 'Error saving data', error: err }));
  });

  router.put('/:id', (req, res) => {
    const { id } = req.params;
    readDataFromFile()
      .then((data: T[]) => {
        const index = data.findIndex(item => item.id === id);
        if (index === -1) {
          // TODO
          // return res.status(404).json({ message: 'Item not found' });
        }
        data[index] = { ...data[index], ...req.body };
        dataInMemory = data;
        return writeDataToFile();
      })
      .then(() => res.json({ message: 'Item updated successfully' }))
      .catch(err => res.status(500).json({ message: 'Error updating data', error: err }));
  });

  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    readDataFromFile()
      .then(data => {
        const filteredData = data.filter(item => item.id !== id);
        dataInMemory = filteredData;
        return writeDataToFile();
      })
      .then(() => res.status(204).send())
      .catch(err => res.status(500).json({ message: 'Error deleting data', error: err }));
  });

  return router;
};

interface User {
  id?: string;
  name: string;
  email: string;
}

interface Product {
  id?: string;
  title: string;
  price: number;
}

const app = express();
app.use(express.json());

const userRouteOptions: RouteOptions<User> = {
  path: '/users',
  dataFileName: 'users.json',
  defaultData: [],
};

const productRouteOptions: RouteOptions<Product> = {
  path: '/products',
  dataFileName: 'products.json',
  defaultData: [],
};

app.use(userRouteOptions.path, createFileSystemApi(userRouteOptions));
app.use(productRouteOptions.path, createFileSystemApi(productRouteOptions));

const port = 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
