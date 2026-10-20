/* Owner dashboard — bookings + chat inbox (localStorage demo store). */
;(function () {
  const store = window.ApexStore
  store.seed()
  let filter = 'all'

  const todayIso = new Date().toISOString().split('T')[0]

  function fmtDate(iso) {
    const d = new Date(`${iso}T00:00:00`)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  function reviewMessage(b) {
    return `Hey ${b.name.split(' ')[0]}! Thanks for training with APEX. If you have 30 seconds, a quick Google review means the world to a small studio: ${window.ApexConfig.REVIEW_LINK}`
  }

  function render() {
    const list = document.getElementById('bookings-list')
    const chatsEl = document.getElementById('chats-list')
    const empty = document.getElementById('empty')
    const all = store.all()
    const reviewed = store.reviewedSet()

    document.getElementById('stat-total').textContent = all.length
    document.getElementById('stat-today').textContent = all.filter((b) => b.date === todayIso).length
    document.getElementById('stat-reviews').textContent = all.filter((b) => b.date <= todayIso && !reviewed.has(b.code)).length

    if (filter === 'chats') {
      list.classList.add('hidden')
      chatsEl.classList.remove('hidden')
      const chats = store.chats()
      empty.classList.toggle('hidden', chats.length > 0)
      chatsEl.innerHTML = chats.length
        ? chats
            .map(
              (c) => `<div class="rounded-2xl border border-line bg-panel p-5">
                <p class="text-xs font-bold uppercase tracking-wider text-mist">Chat · ${new Date(c.at).toLocaleString()}</p>
                <pre class="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-mist">${(c.transcript || '').replace(/</g, '&lt;')}</pre>
              </div>`,
            )
            .join('')
        : ''
      return
    }

    chatsEl.classList.add('hidden')
    list.classList.remove('hidden')

    let rows = all
    if (filter === 'today') rows = all.filter((b) => b.date === todayIso)
    if (filter === 'upcoming') rows = all.filter((b) => b.date > todayIso)
    empty.classList.toggle('hidden', rows.length > 0)

    list.innerHTML = rows
      .map((b) => {
        const isReviewed = reviewed.has(b.code)
        const isToday = b.date === todayIso
        return `<div class="rounded-2xl border ${isToday ? 'border-volt/60 bg-volt/5' : 'border-line bg-panel'} p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-bold text-white">${b.name} ${isToday ? '<span class="ml-2 rounded-full bg-volt px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink">Today</span>' : ''} ${b.source === 'chat' ? '<span class="ml-1 rounded-full border border-line px-2 py-0.5 text-[10px] font-bold uppercase text-mist">AI chat</span>' : ''}</p>
              <p class="mt-1 text-xs text-mist">${b.session} · ${fmtDate(b.date)} · ${b.time} · ${b.location}</p>
              <p class="mt-1 text-xs text-mist">${b.phone}${b.email ? ' · ' + b.email : ''} · Goal: ${b.goal}</p>
              <p class="mt-1 text-[11px] font-semibold tracking-wider text-volt">${b.code}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button data-copy-review="${b.code}" class="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-white hover:border-volt hover:text-volt">Copy review ask</button>
              <button data-copy-sms="${b.code}" class="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-white hover:border-volt hover:text-volt">Copy details</button>
              <button data-reviewed="${b.code}" class="rounded-full ${isReviewed ? 'border-volt bg-volt/10 text-volt' : 'border-line text-mist'} px-3 py-1.5 text-xs font-bold">${isReviewed ? '✓ Reviewed' : 'Mark reviewed'}</button>
            </div>
          </div>
        </div>`
      })
      .join('')

    list.querySelectorAll('[data-copy-review]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const b = store.get(btn.dataset.copyReview)
        await navigator.clipboard.writeText(reviewMessage(b))
        btn.textContent = 'Copied!'
        setTimeout(() => (btn.textContent = 'Copy review ask'), 1500)
      })
    })
    list.querySelectorAll('[data-copy-sms]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const b = store.get(btn.dataset.copySms)
        await navigator.clipboard.writeText(`Appointment: ${b.name} — ${b.session}, ${fmtDate(b.date)} at ${b.time} (${b.location}). Code ${b.code}. Phone: ${b.phone}`)
        btn.textContent = 'Copied!'
        setTimeout(() => (btn.textContent = 'Copy details'), 1500)
      })
    })
    list.querySelectorAll('[data-reviewed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.markReviewed(btn.dataset.reviewed)
        render()
      })
    })
  }

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter
      document.querySelectorAll('.filter-btn').forEach((b) => {
        const active = b === btn
        b.className = `filter-btn rounded-full border px-4 py-2 text-sm font-semibold ${active ? 'border-volt bg-volt/10 text-volt' : 'border-line text-mist'}`
      })
      render()
    })
  })
  document.querySelector('.filter-btn')?.click()
})()
