#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { devto_token } = require("../.env.json");
const { URL } = require("url");
const fetch = require("node-fetch");

const headers = {
  "api-key": devto_token,
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function publish(data) {
  const url = new URL("https://dev.to/api/articles");
  const result = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const jsonResponse = await result.json();

  if (!jsonResponse.url && jsonResponse.error) {
    console.error({ data, jsonResponse });
    throw new Error(
      `Error publishing post, status: ${jsonResponse.error}, error: ${jsonResponse.error}`
    );
  }

  return jsonResponse;
}

async function main({ filePath, title }) {
  const markdownFile = require("fs").readFileSync(filePath, {
    encoding: "utf8",
  });

  // remove everything before the second ---
  const bodyString = markdownFile.toString().split("---")[2];

  const data = {
    article: {
      title,
      date: new Date().toString(),
      published: false,
      body_markdown: bodyString,
    },
  };

  const response = await publish(data);
  console.log("posted to devto:", response);
  console.log(`Preview at https://dev.to/dashboard`);
}

const argv = yargs(hideBin(process.argv))
  .usage(
    './publish-to-devto.js --title="Hello World" --filePath="./path/to/file"'
  )
  .demandOption(["title", "filePath"]).argv;

main(argv);
