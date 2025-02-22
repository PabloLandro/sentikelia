const BASE_URL = "http://localhost:8000";

async function sendChatMessage(message, username) {
  const res = await fetch(BASE_URL + `/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ "message":message, "username": username })
  });
  if (!res.ok) {
    return Promise.reject({ status: res.status, data: await res.json() });
  }

  const data = await res.json()
  const out = data.message
  return out;
}

async function login(username) {
  const res = await fetch(BASE_URL + `/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ "username": username })
  })
  const data = await res.json()
  const out = data.message
  return out == "true";
}

async function submitForm(username, data){
  let payload={}
  payload["username"] = username
  payload["age"] = parseInt(data["age"])
  payload["characteristics"] = data["characteristics"]
  payload["mood"] = data["mood"]
  payload["important_context"] = data["important_context"]
  payload["chat_tone"] = parseInt(data["chat_tone"])
  console.log(payload)
  await fetch(BASE_URL + `/loginform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return
}

export default {
  sendChatMessage,
  login,
  submitForm
};