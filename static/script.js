// DARK MODE - remembers choice
if(localStorage.getItem('dark')==='yes'){document.body.classList.add('dark')}
function toggleDark(){
  document.body.classList.toggle('dark');
  localStorage.setItem('dark', document.body.classList.contains('dark')?'yes':'no');
}
// EYE ICON FOR PASSWORD
function togglePass(id, btn){
  const f = document.getElementById(id);
  if(f.type==='password'){f.type='text'; btn.innerText='🙈';}
  else{f.type='password'; btn.innerText='👁️';}
}

async function sendChat(){
  const input = document.getElementById('chatInput');
  const msg = input.value; if(!msg.trim()) return;
  input.value = "";
  const box = document.getElementById('chatMsgs');
  box.innerHTML += `<div class="msg user">${msg}</div>`;
  const res = await fetch('/api/chatbot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})});
  const d = await res.json();
  box.innerHTML += `<div class="msg ai">${d.reply}</div>`;
  box.scrollTop = box.scrollHeight;
}
async function summarizeNotes(){
  const notes = document.getElementById('notesInput').value;
  document.getElementById('summaryOut').innerText = "Summarizing...";
  const res = await fetch('/api/summarize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({notes})});
  const d = await res.json();
  document.getElementById('summaryOut').innerText = d.summary;
}
async function predictExam(){
  const unit = document.getElementById('unitInput').value;
  const topics = document.getElementById('topicsInput').value;
  document.getElementById('predOut').innerText = "Predicting...";
  const res = await fetch('/api/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({unit,topics})});
  const d = await res.json();
  document.getElementById('predOut').innerText = d.prediction;
}