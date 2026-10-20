/* Client portal — look up a booking by code (localStorage on this device). */
;(function () {
  const store = window.ApexStore

  function fmtDate(iso) {
    const d = new Date(`${iso}T00:00:00`)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  document.getElementById('lookup-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const code = document.getElementById('lookup-code').value.trim().toUpperCase()
    const err = document.getElementById('lookup-error')
    const result = document.getElementById('result')
    err.classList.add('hidden')
    result.classList.add('hidden')

    const b = store.get(code)
    if (!b) {
      err.textContent = 'No booking found with that code on this device. Check your confirmation email — or call us and we\'ll look it up.'
      err.classList.remove('hidden')
      return
    }

    const soon = new Date(`${b.date}T00:00:00`) <= new Date(Date.now() + 864e5)
    result.innerHTML = `
      ${soon ? '<div class="mb-5 rounded-xl border border-volt/50 bg-volt/10 px-4 py-3 text-sm font-bold text-volt">Coming up soon — see you there!</div>' : ''}
      <div class="flex items-center justify-between gap-4">
        <h2 class="font-display text-2xl uppercase text-white">${b.session}</h2>
        <span class="rounded-lg bg-ink px-3 py-1.5 font-mono text-xs tracking-widest text-volt">${b.code}</span>
      </div>
      <dl class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-line bg-ink p-4"><dt class="text-[11px] font-bold uppercase tracking-wider text-mist">Date</dt><dd class="mt-1 text-sm font-semibold text-white">${fmtDate(b.date)}</dd></div>
        <div class="rounded-xl border border-line bg-ink p-4"><dt class="text-[11px] font-bold uppercase tracking-wider text-mist">Time</dt><dd class="mt-1 text-sm font-semibold text-white">${b.time}</dd></div>
        <div class="rounded-xl border border-line bg-ink p-4"><dt class="text-[11px] font-bold uppercase tracking-wider text-mist">Location</dt><dd class="mt-1 text-sm font-semibold text-white">${b.location}</dd></div>
        <div class="rounded-xl border border-line bg-ink p-4"><dt class="text-[11px] font-bold uppercase tracking-wider text-mist">Goal</dt><dd class="mt-1 text-sm font-semibold text-white">${b.goal || '—'}</dd></div>
      </dl>
      <div class="mt-6 flex flex-wrap gap-3">
        <button id="portal-cal" class="rounded-full bg-volt px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-white">📅 Add to calendar (with reminder)</button>
        <a href="book.html" class="rounded-full border border-line px-6 py-3 text-sm font-bold text-white transition-colors hover:border-volt hover:text-volt">Book another</a>
      </div>`
    result.classList.remove('hidden')
    document.getElementById('portal-cal').addEventListener('click', () => window.ApexIcs.download(b))
  })
})()
