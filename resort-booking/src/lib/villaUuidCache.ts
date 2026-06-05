const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

let uuidByPublicId = new Map<string, string>();

export function setVillaUuidCache(entries: Map<string, string>): void {
  uuidByPublicId = entries;
}

export function clearVillaUuidCache(): void {
  uuidByPublicId = new Map();
}

export function getVillaUuidFromCache(roomId: string): string | null {
  if (!roomId) return null;
  if (isUuid(roomId)) {
    return uuidByPublicId.get(roomId) ?? roomId;
  }
  return uuidByPublicId.get(roomId) ?? uuidByPublicId.get(`legacy:${roomId}`) ?? null;
}

export function buildVillaUuidCache(
  villas: { id: string; legacy_id?: string | null }[],
  publicId: (row: { id: string; legacy_id?: string | null }) => string,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const villa of villas) {
    map.set(villa.id, villa.id);
    const pid = publicId(villa);
    map.set(pid, villa.id);
    if (villa.legacy_id) map.set(`legacy:${villa.legacy_id}`, villa.id);
  }
  return map;
}
