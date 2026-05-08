import apiClient from "./apiClient";
import type { User } from "../types";

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>("/users");
    return res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.patch(`/users/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.patch(`/users/${id}/activate`);
  },
};
