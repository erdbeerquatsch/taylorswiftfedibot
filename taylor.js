import fs from "node:fs";
import { createRestAPIClient } from "masto";
import schedule from "node-schedule";

const required_env_vars = ["TOKEN", "URL"];

for (const env_var of required_env_vars) {
  if (!process.env[env_var]) {
    console.error(`${env_var} is missing.`);
    process.exit(1);
  }
}

const readFile = () => {
  try {
    return fs.readFileSync("quotes", "utf8");
  } catch (err) {
    console.error(err);
  }
};

const getQuote = () => {
  let data = readFile();

  let quotes = data.split("\n");
  //console.log(data);

  let number = Math.random() * quotes.length;
  return quotes[Math.round(number)];
};

async function post(quote) {
  const masto = createRestAPIClient({
    url: process.env.URL,
    accessToken: process.env.TOKEN,
  });

  const status = await masto.v1.statuses.create({
    status: quote,
  });

  console.log(status.url);
}

schedule.scheduleJob("13 13 * * *", async () => {
  let quote = getQuote();
  await post(quote);
});
