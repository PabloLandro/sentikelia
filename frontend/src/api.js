const BASE_URL = "http://localhost:8000";

async function sendChatMessage(message) {
  const res = await fetch(BASE_URL + `/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) {
    return Promise.reject({ status: res.status, data: await res.json() });
  }

  const data = await res.json()
  const out = data.message
  return out;
}

export default {
  sendChatMessage
};