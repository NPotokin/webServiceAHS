import getDataAndTransformIt from './dataCollector.js';
import express from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
const app = express();

app.get('/', (req, res) => {
    try {
        prisma.$connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1); // Exit the application on connection error
      }
})
// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

getDataAndTransformIt();

