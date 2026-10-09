export async function createDonation(donorId, payload) {
  let response;
  try {
    response = await fetch(`/api/donations?donorId=${encodeURIComponent(donorId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) {
    // The backend returns { message, detail, status, ... }. Keep its useful detail.
    throw new Error(data?.detail || data?.message || `Request failed (HTTP ${response.status}). Please try again.`);
  }
  if (response.status !== 201 || data?.id == null) {
    throw new Error('The server returned an unexpected response. Check your donations before submitting again.');
  }
  return data;
}
// Read this donor's donations.
export async function getDonorDonations(donorId) {
  const response = await fetch(
    `/api/donations/donor/${encodeURIComponent(donorId)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || data.message || 'Could not load donations.'
    );
  }

  return data;
}

// Change a donation's status to CANCELLED.
export async function cancelDonation(donationId) {
  const response = await fetch(
    `/api/donations/${encodeURIComponent(donationId)}/status?status=CANCELLED`,
    { method: 'PATCH' }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || data.message || 'Could not cancel donation.'
    );
  }

  return data;
}

// Read this donor's dashboard statistics.
export async function getDonorStats(donorId) {
  const response = await fetch(
    `/api/dashboard/user/${encodeURIComponent(donorId)}/stats`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      data.message ||
      'Could not load donation statistics.'
    );
  }

  return data;
}