/* APEX shared store + config + helpers used by every page.
   Single source of truth for owner email, review link, booking persistence. */
window.ApexConfig = {
  // Owner gets emailed every booking here (FormSubmit, no signup).
  OWNER_EMAIL: 'saadabdullah7599@gmail.com',
  // Google review link — replace with the client's real "Leave a review" URL.
  REVIEW_LINK: 'https://g.page/r/REPLACE-ME/review',
  BUSINESS_NAME: 'APEX Personal Training',
}

;(function () {
  const KEY = 'apex_bookings'
  const REVIEWED_KEY = 'apex_reviewed'
  const CHAT_KEY = 'apex_chats'

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  }

  function persist(list) {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 300)))
  }

  function save(booking) {
    const list = all()
    list.unshift(booking)
    persist(list)
    return booking
  }

  function get(code) {
    return all().find((b) => b.code === code) || null
  }

  function update(code, patch) {
    const list = all()
    const i = list.findIndex((b) => b.code === code)
    if (i === -1) return
    list[i] = { ...list[i], ...patch }
    persist(list)
  }

  function markReviewed(code) {
    const set = new Set(JSON.parse(localStorage.getItem(REVIEWED_KEY) || '[]'))
    set.add(code)
    localStorage.setItem(REVIEWED_KEY, JSON.stringify([...set]))
  }

  function reviewedSet() {
    return new Set(JSON.parse(localStorage.getItem(REVIEWED_KEY) || '[]'))
  }

  function saveChat(transcript) {
    const list = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]')
    list.unshift({ at: new Date().toISOString(), transcript })
    localStorage.setItem(CHAT_KEY, JSON.stringify(list.slice(0, 100)))
  }

  function chats() {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]')
  }

  // Demo seed so the dashboard looks alive the first time it's opened.
  function seed() {
    if (localStorage.getItem(KEY)) return
    const today = new Date()
    const iso = (d) => d.toISOString().split('T')[0]
    const day = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return iso(d) }
    persist([
      { code: 'APEX-58291', session: '1-on-1 Training Session (60 min)', date: day(0), time: '10:30 AM', location: 'In-Studio', goal: 'Fat loss', name: 'Sam Carter', phone: '(555) 014-2270', email: 'sam@example.com', notes: '', source: 'chat', createdAt: new Date(Date.now() - 36e5).toISOString() },
      { code: 'APEX-41870', session: 'Free Consult (30 min)', date: day(1), time: '9:00 AM', location: 'In-Studio', goal: 'Muscle gain', name: 'Priya Nair', phone: '(555) 220-8841', email: 'priya@example.com', notes: 'Knee rehab history', source: 'form', createdAt: new Date(Date.now() - 72e5).toISOString() },
      { code: 'APEX-30556', session: 'Small Group Training (60 min)', date: day(2), time: '6:00 PM', location: 'In-Studio', goal: 'Strength', name: 'Andre Kim', phone: '(555) 771-0099', email: 'andre@example.com', notes: '', source: 'chat', createdAt: new Date(Date.now() - 864e5).toISOString() },
      { code: 'APEX-27431', session: 'Nutrition Coaching (45 min)', date: day(-1), time: '1:00 PM', location: 'Online', goal: 'General health', name: 'Dana Reyes', phone: '(555) 663-4412', email: 'dana@example.com', notes: '', source: 'form', createdAt: new Date(Date.now() - 1728e5).toISOString() },
    ])
  }

  window.ApexStore = { all, save, get, update, markReviewed, reviewedSet, saveChat, chats, seed }
})()

window.ApexSubmit = {
  async send(payload) {
    const { OWNER_EMAIL } = window.ApexConfig
    if (!OWNER_EMAIL) {
      await new Promise((r) => setTimeout(r, 500))
      return { demo: true }
    }
    const res = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New booking: ${payload.name} · ${payload.date} ${payload.time}`,
        _template: 'table',
        _captcha: 'false',
        _replyto: payload.email || payload.phone,
        Session: payload.session,
        Date: `${payload.date} ${payload.time}`,
        Location: payload.location,
        Goal: payload.goal || 'Not specified',
        Name: payload.name,
        Phone: payload.phone,
        Email: payload.email || '—',
        Notes: payload.notes || '—',
        Source: payload.source || 'website',
        'Booking code': payload.code,
      }),
    })
    const data = await res.json().catch(() => null)
    const failed = !res.ok || data?.success === false || data?.success === 'false'
    const pendingActivation = failed && /activ/i.test(String(data?.message ?? ''))
    if (failed && !pendingActivation) {
      throw new Error('Booking could not be sent. Please try again or call the studio.')
    }
    return { ok: true }
  },
}

window.ApexIcs = {
  download(booking) {
    const start = ApexIcs._dt(booking.date, booking.time)
    if (!start) return
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const fmt = (d) =>
      d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + 'T' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + '00'
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//APEX//Booking//EN', 'BEGIN:VEVENT',
      `UID:${booking.code}@apex`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${ApexConfig.BUSINESS_NAME} — ${booking.session}`,
      `LOCATION:${booking.location === 'Online' ? 'Online' : '214 Ironworks Ave, Austin, TX'}`,
      `DESCRIPTION:Booking code ${booking.code}. Arrive 10 minutes early.`,
      'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Appointment in 1 hour', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ]
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${booking.code}.ics`
    a.click()
    URL.revokeObjectURL(a.href)
  },
  _dt(dateStr, timeStr) {
    try {
      const m = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!m) return null
      let h = parseInt(m[1], 10) % 12
      if (/PM/i.test(m[3])) h += 12
      const d = new Date(`${dateStr}T00:00:00`)
      d.setHours(h, parseInt(m[2], 10), 0, 0)
      return d
    } catch { return null }
  },
}
