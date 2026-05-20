export async function writeConfigViaHttp(
  playerUrl: string,
  auJson: string,
): Promise<void> {
  const endpoint = `${playerUrl.replace(/\/$/, '')}/test-config`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: auJson,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Player dev server responded ${res.status}: ${text}`);
  }
  const json = await res.json().catch(() => ({ success: false }));
  if (!json.success) {
    throw new Error(json.error ?? 'Player dev server returned success:false');
  }
}

export async function writeConfigViaIpc(
  auJson: string,
  playerUrl: string,
  configPath: string,
): Promise<void> {
  const result = await (window as any).ipc.testInPlayer(
    auJson,
    playerUrl,
    configPath,
  );
  if (!result?.success) {
    throw new Error(result?.error ?? 'IPC call returned success:false');
  }
}

export async function loadLessonViaZip(
  playerUrl: string,
  zipBlob: Blob,
  lessonDirPath: string,
): Promise<void> {
  const endpoint = `${playerUrl.replace(/\/$/, '')}/upload-lesson-zip?lessonDirPath=${encodeURIComponent(lessonDirPath)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: zipBlob,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Player dev server responded ${res.status}: ${text}`);
  }
  const json = await res.json().catch(() => ({ success: false }));
  if (!json.success) {
    throw new Error(json.error ?? 'Player dev server returned success:false');
  }
}
