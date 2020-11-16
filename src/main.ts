import fs from 'fs';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const url = process.env.DANFE_URL;

const writeNoteHTML = (file) => {
  const time: Date = new Date();
  const month = time.getMonth() + 1;
  const year = time.getFullYear();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const fileName = `sefaz-${month}-${year}_${hours}-${minutes}`;

  fs.writeFile(`tmp/${fileName}.html`, JSON.stringify(file), (err) => {
    if (Boolean(err)) return console.log(err);
    return console.log('The file was saved');
  });

  return fileName;
}

(async () => {
  let $ = null;

  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto(url);

  const sefazIframeContent = await page.content();
  $ = cheerio.load(sefazIframeContent);
  const urlWithContent = $('#iframeConteudo').attr('src');
  
  await page.goto(urlWithContent);
  const content = await page.content();
  $ = cheerio.load(content);
  
  writeNoteHTML($('html').html());

  await browser.close();
})();
