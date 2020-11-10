import { getCustomRepository, getRepository } from 'typeorm';

import loadCSV from '../config/csvReader';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionsCsv = await loadCSV(path);

    const transactions = await Promise.all(
      transactionsCsv.map(async ({ title, type, value, categoryName }) => {
        let category = await categoriesRepository.findOne({
          title: categoryName,
        });

        if (!category) {
          category = categoriesRepository.create({ title: categoryName });
          await categoriesRepository.save(category);
        }

        const transaction = transactionsRepository.create({
          title,
          value,
          type,
          category,
        });

        return transaction;
      }),
    );

    await transactionsRepository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
