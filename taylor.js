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

  let number = Math.random() * quotes.length;
  return quotes[Math.round(number)];
};

const updateUsedQuote = (quote) => {
  try {
    fs.writeFileSync("./usedquotes", quote + "\n", { flag: "a" });
  } catch (err) {
    console.error(err);
  }
};

const readUsedQuote = () => {
  try {
    return fs.readFileSync("./usedQuotes", "utf8");
  } catch (err) {
    console.error(err);
  }
};

const getUnusedQuote = () => {
  let data = readUsedQuote();

  let usedQuotes = data.split("\n");

  while (true) {
    let quote = getQuote();

    if (!usedQuotes.includes(quote)) {
      return quote;
    }

    console.log("Quote already used: " + quote);
  }
};

async function post(quote) {
  const masto = createRestAPIClient({
    url: process.env.URL,
    accessToken: process.env.TOKEN,
  });

  const cwQuote = quote.split(";");

  const status = cwQuote[0];
  let spoiler = null;

  if (cwQuote.length === 2) {
    spoiler = cwQuote[1];
  }

  const post = await masto.v1.statuses.create({
    status: status,
    spoilerText: spoiler,
  });
  console.log(post.url);
}

schedule.scheduleJob("13 13 * * *", async () => {
  let quote = getUnusedQuote();

  if (quote === undefined) {
    console.log("Every quote is used. Do nothing.");
    return;
  }
  await post(quote);
  updateUsedQuote(quote);
});
