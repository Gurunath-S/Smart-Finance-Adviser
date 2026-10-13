import { useTransactionContext } from '../context/TransactionContext';

export const useTransactions = () => {
  return useTransactionContext();
};
