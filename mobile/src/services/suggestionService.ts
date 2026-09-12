import { api } from './api';
import { SuggestionApiResponse, SuggestionHistoryItem } from '../types';

export const suggestionService = {
  async getSuggestions(
    balance: number,
    income: number,
    expenses: number
  ): Promise<SuggestionApiResponse> {
    const response = await api.post<SuggestionApiResponse>('/v1/get-suggestions', {
      balance,
      income,
      expenses,
    });
    return response.data;
  },

  async saveSuggestions(
    suggestions: string[],
    itemsUsedCount?: number
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/v1/saveSuggestions', {
      suggestions,
      itemsUsedCount: itemsUsedCount || suggestions.length,
    });
    return response.data;
  },

  async getSavedSuggestions(): Promise<SuggestionHistoryItem[]> {
    const response = await api.get<SuggestionHistoryItem[]>('/v1/get-saved-suggestions');
    return response.data;
  },
};
