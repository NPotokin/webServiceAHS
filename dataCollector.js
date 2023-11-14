import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const url = 'https://www.albertahealthservices.ca/Webapps/WaitTimes/api/waittimes/en';

async function getDataAndTransformIt() {
  try {
    const response = await axios.get(url);
    const dataSet = response.data;
    console.log(response.data);

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const day = currentDate.getDate();
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();

    for (const city in dataSet) {
      if (dataSet.hasOwnProperty(city)) {
        for (const category in dataSet[city]) {
          if (dataSet[city].hasOwnProperty(category)) {
            for (const obj of dataSet[city][category]) {
              const waitTime = obj.WaitTime;
              const transformedWaitTime = parseFloat(
                transformWaitTimeToMinutes(waitTime).toFixed(2)
              );

              const extractedData = {
                Name: obj.Name,
                waitTimeHr: transformedWaitTime,
                year: year,
                month: month,
                day: day,
                hour: hour,
                minute: minute,
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
}

// Set up an interval to call getDataAndTransformIt every 2 minutes (120,000 milliseconds)
setInterval(getDataAndTransformIt, 120000);

export default getDataAndTransformIt;