import { api } from './api';

export const userService = {
  async updateProfileImage(
    fileUri: string,
    mimeType = 'image/jpeg',
    fileName = 'avatar.jpg'
  ): Promise<{ message: string; profileImage: string }> {
    const formData = new FormData();
    formData.append('image', {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    } as unknown as Blob);

    const response = await api.put<{ message: string; profileImage: string }>(
      '/users/update-profile-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
