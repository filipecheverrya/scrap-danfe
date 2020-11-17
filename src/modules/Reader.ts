import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

interface iProduct {
  id: string,
  code: string;
  title: string;
  quantity: string;
  unity: string;
  price: {
    unity: string;
    total: string;
  }
}

function productParser($: cheerio.Root, row: cheerio.Cheerio): Array<iProduct> {
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
    obj.id = uuidv4();
    if (i > 3) {
      obj.price[map[i]] = text
      if (i === 5) return arr.push(obj);
    }
    obj[map[i]] = text;
  });
  
  return arr;
}

function getProductsParsed($: cheerio.Root) {
  const products: Array<iProduct> = [];
  
  $('table.NFCCabecalho .NFCDetalhe_Item').each((i: number, el: cheerio.Element) => {
    if ($(el).text().toLowerCase() === 'código') {
      $(el).parents('.NFCCabecalho').find('tr').each((id: number, elem: cheerio.Element) => {
        const isTableHeader: boolean = id === 0;
        if (isTableHeader) return;
        const columns: cheerio.Cheerio = $(elem).find('td');
        const [prod] = productParser($, columns);
        products.push(prod);
      });
    }
  });
  
  return products;
}

function formatToHTML(file: string): string {
  return file
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n');
}

function inspectFile(elementHtml: string) {
  const context: cheerio.Root = cheerio.load(formatToHTML(elementHtml));
  const products: Array<iProduct> = getProductsParsed(context);

  console.log(products);
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