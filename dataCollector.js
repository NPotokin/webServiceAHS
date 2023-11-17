import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const url = process.env.REQUEST_URL;

async function getDataAndTransformIt() {
  try {
    const response = await axios.get(url);
    const dataSet = response.data;
    console.log(response.data);

    const currentDate = new Date(); // Current date and time
    const currentUTCDate = new Date(Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate(),
      currentDate.getUTCHours(),
      currentDate.getUTCMinutes(),
      currentDate.getUTCSeconds()
    ));
    
    for (const city in dataSet) {
      if (dataSet.hasOwnProperty(city)) {
        for (const category in dataSet[city]) {
          if (dataSet[city].hasOwnProperty(category)) {
            for (const obj of dataSet[city][category]) {
              const waitTime = obj.WaitTime;
              const transformedWaitTime = parseFloat(
                transformWaitTimeToMinutes(waitTime).toFixed(2)
              );

              // Generate slug based on the hospital name
              const slug = obj.Name
                .toLowerCase()
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters
                .split(' ')
                .map((word, index) => {
                  if (index === 0) {
                    return word.toLowerCase();
                  }
                  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join('');

              const extractedData = {
                Name: obj.Name,
                slug: slug,
                waitTimeMin: transformedWaitTime,
                dateTime: currentUTCDate
              };

              try {
                // Create a new entry in the database using Prisma
                const dbInput = await prisma.hospitalTimeStamp.create({
                  data: extractedData,
                });
                console.log('Document created:', dbInput);
              } catch (error) {
                console.error('Error creating document:', error);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function transformWaitTimeToMinutes(waitTimeString) {
  const parts = waitTimeString.split(' ');
  let totalMinutes = 0;

  if (parts.length === 4 && parts[1] === 'hr' && parts[3] === 'min') {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[2], 10);
    totalMinutes = hours * 60 + minutes;
  }

  return totalMinutes;
};

// Set up an interval to call getDataAndTransformIt every 2 minutes (120,000 milliseconds)
setInterval(getDataAndTransformIt, 120000);

export default getDataAndTransformIt;