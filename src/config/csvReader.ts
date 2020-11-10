import csvParse from 'csv-parse';
import fs from 'fs';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryName: string;
}

async function loadCSV(filePath: string): Promise<TransactionCSV[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const transactions: TransactionCSV[] = [];

  parseCSV.on('data', line => {
    const [title, type, value, categoryName] = line;

    const transaction: TransactionCSV = { title, type, value, categoryName };

    transactions.push(transaction);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  await fs.promises.unlink(filePath);

  return transactions;
}

export default loadCSV;
