import type { AvailabilityResult } from './availability';

export async function verifyRoomAvailabilityRemote(params: {
  roomId: string;
  checkIn: string;
  checkOut: string;
}): Promise<AvailabilityResult> {
  const response = await fetch('/api/check-availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const text = await response.text();
  let data: AvailabilityResult & { error?: string };
  try {
    data = JSON.parse(text) as AvailabilityResult & { error?: string };
  } catch {
    throw new Error('Availability check returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Availability check failed.');
  }

  return data;
}
