const BASE_URL = "http://localhost:8000";

async function sendChatMessage(message, username) {
  const res = await fetch(BASE_URL + `/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ "message":message, "username": username }),
    mode: 'cors'  // Explicitly enable CORS
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
  payload["important_context"] = data["important_context"]
  payload["chat_tone"] = parseInt(data["chat_tone"])
  payload["mensajes_chat"] = [];
  console.log(payload);
  await fetch(BASE_URL + `/loginform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors'  // Explicitly enable CORS
  })
  return
}

async function addDiaryEntry(username, diaryEntry, date) {
  const payload = {}
  payload["username"] = username
  payload["entry"] = { "entry": diaryEntry, "date": date}
  console.log(payload)
  await fetch(BASE_URL + `/diary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: 'cors'
  })
  return
}

async function getDiaryEntries(username) {
  const res = await fetch(BASE_URL + `/diary?username=${encodeURIComponent(username)}`, {
    method: "GET",
    header: { "Content-Type": "application/json" },
    mode: "cors"
  })
  const rawBody = await res.text();
  const data = JSON.parse(rawBody);
  console.log("Parsed response JSON:", data);
  return data; // Assuming the response contains a `message` property
}

export default {
  sendChatMessage,
  login,
  submitForm,
  addDiaryEntry,
  getDiaryEntries
};