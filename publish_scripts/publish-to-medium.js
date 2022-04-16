#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { token } = require("../.env.json");
const { URL, URLSearchParams } = require("url");
const fetch = require("node-fetch");

const { HTTPResponseError } = require("./shared.js");

const headers = {
  Accept: "application/json",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.5",
  Connection: "keep-alive",
  "Accept-Charset": "utf-8",
  Host: "api.medium.com",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
};

async function getAuthorId() {
  const url = new URL("https://api.medium.com/v1/me");
  url.search = new URLSearchParams({ Authorization: `Bearer ${token}` });
  const result = await fetch(url, { headers, method: "GET" });
  if (result.status >= 400) {
    throw new HTTPResponseError(result, "Error getting author id");
  }

  const jsonResponse = await result.json();
  return jsonResponse.data.id;
}

async function publish(data) {
  const authorId = await getAuthorId();

  const url = new URL(`https://api.medium.com/v1/users/${authorId}/posts`);
  const result = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (result.status >= 400) {
    throw new HTTPResponseError(result, "Error publishing post");
  }

  const jsonResponse = await result.json();

  return jsonResponse.data.url;
}

async function main({ filePath, title }) {
  const markdownFile = require("fs").readFileSync(filePath, {
    encoding: "utf8",
  });

  const data = {
    title: title,
    contentFormat: "markdown",
    content: markdownFile.toString(),
    publishStatus: "draft",
  };

  const url = await publish(data);
  console.log("posted to medium:", url);
}

const argv = yargs(hideBin(process.argv))
  .usage(
    './publish-to-medium.js --title="Hello World" --filePath="./path/to/file"'
  )
  .demandOption(["title", "filePath"]).argv;

main(argv);
