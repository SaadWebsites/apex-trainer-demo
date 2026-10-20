/* APEX AI chat widget — scripted booking assistant.
   Add <script src="assets/chat.js"></script> to any page to enable. */
;(function () {
  const SLOTS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']
  const SERVICES = [
    { label: 'Free consult (30 min, free)', value: 'Free Consult (30 min)' },
    { label: '1-on-1 training ($75)', value: '1-on-1 Training Session (60 min)' },
    { label: 'Small group ($35)', value: 'Small Group Training (60 min)' },
    { label: 'Nutrition coaching ($50)', value: 'Nutrition Coaching (45 min)' },
  ]
  const GOALS = ['Fat loss', 'Muscle gain', 'Strength', 'Sport performance', 'General health']

  let state = 'idle'
  let data = {}
  let open = false

  const $ = (id) => document.getElementById(id)

  function inject() {
    if ($('apex-chat-btn')) return
    const style = document.createElement('style')
    style.textContent = `
      #apex-chat-btn{position:fixed;right:20px;bottom:20px;z-index:90;display:flex;align-items:center;gap:.55rem;background:#cdff3d;color:#0a0a0b;border:none;border-radius:999px;padding:.85rem 1.25rem;font-weight:800;font-size:.9rem;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.45);transition:transform .15s}
      #apex-chat-btn:hover{transform:translateY(-2px)}
      #apex-chat-panel{position:fixed;right:20px;bottom:84px;z-index:91;width:min(370px,calc(100vw - 40px));height:min(560px,calc(100vh - 120px));background:#121215;border:1px solid #26262b;border-radius:18px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6);font-family:Inter,system-ui,sans-serif}
      #apex-chat-panel.open{display:flex}
      .ac-head{display:flex;align-items:center;gap:.7rem;padding:14px 16px;background:#0a0a0b;border-bottom:1px solid #26262b}
      .ac-avatar{width:36px;height:36px;border-radius:999px;background:#cdff3d;color:#0a0a0b;display:flex;align-items:center;justify-content:center;font-weight:900;font-family:Anton,sans-serif}
      .ac-title{color:#fff;font-weight:700;font-size:.9rem}
      .ac-sub{color:#a1a1aa;font-size:.72rem;display:flex;align-items:center;gap:4px}
      .ac-dot{width:7px;height:7px;border-radius:99px;background:#4ade80;display:inline-block}
      .ac-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
      .ac-m{max-width:82%;padding:10px 13px;border-radius:14px;font-size:.83rem;line-height:1.45}
      .ac-bot{background:#1e1e22;color:#e4e4e7;border-bottom-left-radius:4px;align-self:flex-start}
      .ac-user{background:#cdff3d;color:#0a0a0b;border-bottom-right-radius:4px;align-self:flex-end;font-weight:600}
      .ac-typing{display:flex;gap:4px;align-self:flex-start;padding:12px 14px;background:#1e1e22;border-radius:14px;border-bottom-left-radius:4px}
      .ac-typing span{width:6px;height:6px;border-radius:99px;background:#71717a;animation:acblink 1.2s infinite}
      .ac-typing span:nth-child(2){animation-delay:.2s}.ac-typing span:nth-child(3){animation-delay:.4s}
      @keyframes acblink{0%,80%,100%{opacity:.3}40%{opacity:1}}
      .ac-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 14px 14px}
      .ac-chip{background:#0a0a0b;border:1px solid #3f3f46;color:#fff;border-radius:999px;padding:7px 13px;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .15s}
      .ac-chip:hover{border-color:#cdff3d;color:#cdff3d}
      .ac-input{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #26262b;background:#0a0a0b}
      .ac-input input{flex:1;background:#121215;border:1px solid #26262b;border-radius:10px;padding:10px 12px;color:#fff;font-size:.83rem;outline:none}
      .ac-input input:focus{border-color:#cdff3d}
      .ac-input button{background:#cdff3d;border:none;border-radius:10px;width:42px;font-weight:900;cursor:pointer;color:#0a0a0b}
      .ac-summary{background:#0a0a0b;border:1px solid #cdff3d;border-radius:12px;padding:12px;font-size:.8rem;color:#e4e4e7;margin-top:4px}
      .ac-summary b{color:#cdff3d}
    `
    document.head.appendChild(style)

    const btn = document.createElement('button')
    btn.id = 'apex-chat-btn'
    btn.innerHTML = '<span style="font-size:1.1rem">💬</span> Chat to book'
    btn.setAttribute('aria-label', 'Open booking chat')
    document.body.appendChild(btn)

    const panel = document.createElement('div')
    panel.id = 'apex-chat-panel'
    panel.innerHTML = `
      <div class="ac-head">
        <div class="ac-avatar">A</div>
        <div><div class="ac-title">APEX Assistant</div><div class="ac-sub"><span class="ac-dot"></span> Online · replies instantly</div></div>
      </div>
      <div class="ac-msgs" id="ac-msgs"></div>
      <div class="ac-chips" id="ac-chips"></div>
      <form class="ac-input" id="ac-form"><input id="ac-text" placeholder="Type a message…" autocomplete="off" /><button type="submit" aria-label="Send">↑</button></form>
    `
    document.body.appendChild(panel)

    btn.addEventListener('click', () => {
      open = !open
      panel.classList.toggle('open', open)
      if (open && state === 'idle') start()
      if (open) $('ac-text')?.focus()
    })
    $('ac-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const v = $('ac-text').value.trim()
      if (!v) return
      $('ac-text').value = ''
      handleInput(v)
    })
  }

  function scroll() { const m = $('ac-msgs'); m.scrollTop = m.scrollHeight }

  function bot(text, chips) {
    const m = $('ac-msgs')
    const div = document.createElement('div')
    div.className = 'ac-m ac-bot'
    div.innerHTML = text
    m.appendChild(div)
    renderChips(chips)
    scroll()
  }

  function user(text) {
    const div = document.createElement('div')
    div.className = 'ac-m ac-user'
    div.textContent = text
    $('ac-msgs').appendChild(div)
    scroll()
  }

  function typing(ms, then) {
    const m = $('ac-msgs')
    const t = document.createElement('div')
    t.className = 'ac-typing'
    t.innerHTML = '<span></span><span></span><span></span>'
    m.appendChild(t)
    scroll()
    setTimeout(() => { t.remove(); then() }, ms)
  }

  function renderChips(chips) {
    const c = $('ac-chips')
    c.innerHTML = ''
    ;(chips || []).forEach((chip) => {
      const b = document.createElement('button')
      b.className = 'ac-chip'
      b.type = 'button'
      b.textContent = chip.label
      b.addEventListener('click', () => { user(chip.label); chip.action() })
      c.appendChild(b)
    })
  }

  function start() {
    data = {}
    state = 'service'
    typing(600, () => bot("Hi! I'm the APEX booking assistant. I can book your session right here — what would you like?", SERVICES.map((s) => ({ label: s.label, action: () => pickService(s.value) }))))
  }

  function pickService(value) {
    data.session = value
    state = 'date'
    const today = new Date()
    const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const chips = []
    for (let i = 0; i < 5; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i)
      chips.push({ label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : fmt(d), action: () => pickDate(d.toISOString().split('T')[0]) })
    }
    typing(500, () => bot('Great choice. Which day works for you?', chips))
  }

  function pickDate(date) {
    data.date = date
    state = 'time'
    const chips = SLOTS.slice(0, 10).map((t) => ({ label: t, action: () => pickTime(t) }))
    typing(450, () => bot('Pick a time slot:', chips))
  }

  function pickTime(time) {
    data.time = time
    data.location = 'In-Studio'
    state = 'goal'
    typing(400, () => bot("What's your main goal? (helps the coach prep)", GOALS.map((g) => ({ label: g, action: () => pickGoal(g) }))))
  }

  function pickGoal(goal) {
    data.goal = goal
    state = 'name'
    typing(350, () => bot("What's your first name?"))
  }

  function pickName(name) {
    data.name = name
    state = 'phone'
    typing(350, () => bot("And a phone number so the coach can confirm?", []))
  }

  function pickPhone(phone) {
    data.phone = phone
    state = 'confirm'
    const d = new Date(`${data.date}T00:00:00`)
    const nice = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    typing(500, () => {
      bot(`Here's your booking:<div class="ac-summary"><b>${data.session}</b><br/>${nice} · ${data.time} · ${data.location}<br/>Goal: ${data.goal}<br/>${data.name} · ${data.phone}</div>Confirm it?`, [
        { label: '✓ Yes, book it', action: submit },
        { label: '↺ Start over', action: () => { $('ac-msgs').innerHTML = ''; start() } },
      ])
    })
  }

  async function submit() {
    state = 'busy'
    renderChips([])
    typing(800, async () => {
      const code = `APEX-${Math.floor(10000 + Math.random() * 90000)}`
      const payload = { ...data, email: '', notes: 'Booked via AI chat', code, source: 'chat' }
      try {
        await window.ApexSubmit.send(payload)
        window.ApexStore.save(payload)
        window.ApexStore.saveChat($('ac-msgs').innerText)
        bot(`Done — you're booked! 🎉 Your code: <b style="color:#cdff3d">${code}</b><br/><br/>Hit <b>Add to calendar</b> so you don't forget:`, [
          { label: '📅 Add to calendar', action: () => window.ApexIcs.download(payload) },
          { label: '⭐ Leave a review', action: () => window.open(window.ApexConfig.REVIEW_LINK, '_blank') },
          { label: 'Book another', action: () => { $('ac-msgs').innerHTML = ''; start() } },
        ])
        state = 'idle'
      } catch {
        bot('Sorry — that failed. Please try the booking page or call the studio directly.', [{ label: '↺ Try again', action: submit }])
      }
    })
  }

  function handleInput(text) {
    const t = text.toLowerCase()
    if (state === 'name') { pickName(text.trim()); return }
    if (state === 'phone') {
      const digits = text.replace(/\D/g, '')
      if (digits.length < 7) { typing(300, () => bot('That number looks short — try again?', [])); return }
      pickPhone(text.trim()); return
    }
    if (/price|cost|how much/.test(t)) { typing(400, () => bot('Consult is free, 1-on-1 is $75, small group $35, nutrition $50.', [])); return }
    if (/hour|open|close/.test(t)) { typing(400, () => bot('We’re open Mon–Fri 5:30am–8pm, Sat 7am–4pm, Sun 8am–2pm.', [])); return }
    if (/where|location|address/.test(t)) { typing(400, () => bot('214 Ironworks Ave, Austin, TX — or we can come to you (In-Home) / online.', [])); return }
    if (/cancel/.test(t)) { typing(400, () => bot('To cancel or reschedule, call (555) 018-2270 or reply to your confirmation email.', [])); return }
    if (/hi|hello|hey/.test(t)) { typing(400, () => bot('Hey! Ready to book a session?', SERVICES.map((s) => ({ label: s.label, action: () => pickService(s.value) })))); return }
    if (state === 'idle' || state === 'service') { start(); return }
    typing(400, () => bot("I didn't catch that — pick an option below or type your answer.", []))
  }

  document.addEventListener('DOMContentLoaded', inject)
})()
