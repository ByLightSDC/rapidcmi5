// src/api/electronFetchApi.ts
import type { ApiFetcher } from '@ts-rest/core';

declare global {
  interface Window {
    electronAPI: any;
  }
}

export const electronFetchApi: ApiFetcher = async ({
  path,
  method,
  headers,
  body,
}) => {
  if (!window.electronAPI) {
    throw new Error('electronFetchApi called outside Electron');
  }

  const res = await window.electronAPI.fetch({
    url: path,
    method,
    headers: headers as Record<string, string>,
    body: body
      ? typeof body === 'string'
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  // ts-rest expects parsed body when content-type is JSON
  const contentType = res.headers['content-type'] ?? '';

  const parsedBody = contentType.includes('application/json')
    ? JSON.parse(res.body)
    : res.body;

  return {
    status: res.status,
    body: parsedBody,
    headers: new Headers(res.headers),
  };
};
