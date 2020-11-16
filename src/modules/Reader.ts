import * as fs from 'fs';
import * as cheerio from 'cheerio';

interface iProduct {
  code: string;
  title: string;
  quantity: string;
  unity: string;
  price: {
    unity: string;
    total: string;
  }
}

function appendProduct($: cheerio.Root, row: cheerio.Cheerio): Array<iProduct> {
  const arr = [];
  const obj: iProduct = {
    price: {}
  } as iProduct;
  const map = {
    0: 'code',
    1: 'title',
    2: 'quantity',
    3: 'unity',
    4: 'unity',
    5: 'total',
  };

  row.each((i: number, el: cheerio.Element) => {
    const text = $(el).text();
    if (i > 3) {
      obj.price[map[i]] = text
      if (i === 5) return arr.push(obj);
    }
    obj[map[i]] = text;
  });
  
  return arr;
}

function formatToHTML(file: string): string {
  return file
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n');
}

function inspectFile(elementHtml: string) {
  const $: cheerio.Root = cheerio.load(formatToHTML(elementHtml));
  $('table.NFCCabecalho .NFCDetalhe_Item').each((i: number, el: cheerio.Element) => {
    if ($(el).text().toLowerCase() === 'código') {
      $(el).parents('.NFCCabecalho').find('tr').each((id: number, elem: cheerio.Element) => {
        const isTableHeader: boolean = id === 0;
        if (isTableHeader) return;
        const columns: cheerio.Cheerio = $(elem).find('td');
        console.log(...appendProduct($, columns));
      });
    }
  });
}

function readFile(name: string) {
  fs.readFile(name, 'utf-8', (err, content) => {
    if (Boolean(err)) return console.log(err);
    inspectFile(content);
  });
}

function init(directory: string) {
  fs.readdir(directory, (err, content) => {
    if (Boolean(err)) return console.log(err);
    const [firstFile] = content;
    return readFile(`${directory}/${firstFile}`);
  });
}

(() => {
  init('tmp/');
})();