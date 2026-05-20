export async function fetchFirstAuId(args: {
  lmsApiBase: string;
  courseId: string;
  token: string;
}): Promise<string> {
  const { lmsApiBase, courseId, token } = args;
  const endpoint = `${lmsApiBase.replace(/\/$/, '')}/api/v1/course/${encodeURIComponent(courseId)}`;
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`LMS responded ${res.status}: ${text}`);
  }
  const json = await res.json();
  const firstAu = json?.metadata?.aus[0];
  const auId = firstAu?.id;
  if (auId === undefined || auId === null) {
    throw new Error('Course response did not include any AUs.');
  }
  return String(auId);
}

export function randomUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function rewriteLaunchHost(
  launchUrl: string,
  playerUrl: string,
): string {
  const remote = new URL(launchUrl);
  const local = new URL(playerUrl);
  return `${local.origin}/index.html${remote.search}${remote.hash}`;
}

export async function fetchLaunchUrl(args: {
  lmsApiBase: string;
  courseId: string;
  auIndex: number;
  token: string;
  actorName: string;
  actorHomePage: string;
  registration: string;
  returnUrl: string;
}): Promise<string> {
  const {
    lmsApiBase,
    courseId,
    auIndex,
    token,
    actorName,
    actorHomePage,
    registration,
    returnUrl,
  } = args;
  const endpoint = `${lmsApiBase.replace(/\/$/, '')}/api/v1/course/${encodeURIComponent(courseId)}/launch-url/${auIndex}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      actor: {
        objectType: 'Agent',
        account: { homePage: actorHomePage, name: actorName },
      },
      reg: registration,
      returnUrl,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`LMS responded ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (!json?.url) {
    throw new Error('LMS response did not include a launch url.');
  }

  return json.url as string;
}
