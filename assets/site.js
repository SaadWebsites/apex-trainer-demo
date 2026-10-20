/* APEX site scripts — nav + booking form.
 *
 * OWNER EMAIL NOTIFICATION (free, no signup):
 * Bookings are emailed to OWNER_EMAIL through formsubmit.co.
 * One-time activation: the FIRST booking makes FormSubmit send an
 * activation email to OWNER_EMAIL — click the link inside it once,
 * then every future booking arrives in that inbox automatically.
 * Set OWNER_EMAIL to '' to run in demo mode (no email sent).
 */
const OWNER_EMAIL = 'saadabdullah7599@gmail.com'

document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initBooking()
})

function initNav() {
  const toggle = document.getElementById('nav-toggle')
  const menu = document.getElementById('mobile-nav')
  if (!toggle || !menu) return

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false
    toggle.setAttribute('aria-expanded', String(open))
  })

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden')
      toggle.setAttribute('aria-expanded', 'false')
    })
  })
}

function initBooking() {
  const form = document.getElementById('booking-form')
  if (!form) return

  const panel = document.getElementById('booking-panel')
  const successPanel = document.getElementById('success-panel')
  const submitBtn = document.getElementById('submit-btn')
  const formError = document.getElementById('form-error')
  const demoNote = document.getElementById('demo-note')
  const dateEl = document.getElementById('f-date')

  const today = new Date().toISOString().split('T')[0]
  dateEl.min = today

  const fields = ['session', 'date', 'time', 'name', 'phone', 'email']

  const setError = (field, message) => {
    const el = document.getElementById(`err-${field}`)
    if (!el) return
    el.textContent = message || ''
    el.classList.toggle('hidden', !message)
  }

  const clearErrors = () => fields.forEach((f) => setError(f, ''))

  const radioValue = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`)
    return checked ? checked.value : ''
  }

  const value = (id) => document.getElementById(`f-${id}`).value.trim()

  const validate = () => {
    clearErrors()
    let firstBad = null

    if (!radioValue('session')) {
      setError('session', 'Please choose a session type.')
      firstBad = firstBad || 'session'
    }
    if (!value('date')) {
      setError('date', 'Pick a preferred date.')
      firstBad = firstBad || 'date'
    } else if (value('date') < today) {
      setError('date', 'Date cannot be in the past.')
      firstBad = firstBad || 'date'
    }
    if (!value('time')) {
      setError('time', 'Pick a preferred time.')
      firstBad = firstBad || 'time'
    }
    if (value('name').length < 2) {
      setError('name', 'Enter your full name.')
      firstBad = firstBad || 'name'
    }
    const digits = value('phone').replace(/\D/g, '')
    if (digits.length < 7 || digits.length > 15) {
      setError('phone', 'Enter a valid phone number.')
      firstBad = firstBad || 'phone'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) {
      setError('email', 'Enter a valid email address.')
      firstBad = firstBad || 'email'
    }
    return firstBad
  }

  fields.forEach((f) => {
    const el = document.getElementById(`f-${f}`)
    if (el) el.addEventListener('input', () => setError(f, ''))
  })
  form.querySelectorAll('input[name="session"]').forEach((el) => {
    el.addEventListener('change', () => setError('session', ''))
  })

  const formatDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    formError.classList.add('hidden')

    const bad = validate()
    if (bad) {
      const target = bad === 'session' ? form.querySelector('input[name="session"]') : document.getElementById(`f-${bad}`)
      target?.focus({ preventScroll: false })
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const code = `APEX-${Math.floor(10000 + Math.random() * 90000)}`
    const payload = {
      session: radioValue('session'),
      date: value('date'),
      time: value('time'),
      location: radioValue('location'),
      goal: value('goal') || 'Not specified',
      name: value('name'),
      phone: value('phone'),
      email: value('email'),
      notes: value('notes'),
      code,
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'Sending…'

    try {
      if (OWNER_EMAIL) {
        const res = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: `New booking: ${payload.name} · ${formatDate(payload.date)} ${payload.time}`,
            _template: 'table',
            _captcha: 'false',
            _replyto: payload.email,
            Session: payload.session,
            Date: `${payload.date} ${payload.time}`,
            Location: payload.location,
            Goal: payload.goal,
            Name: payload.name,
            Phone: payload.phone,
            Email: payload.email,
            Notes: payload.notes || '—',
            'Booking code': code,
          }),
        })
        const data = await res.json().catch(() => null)
        const failed = !res.ok || data?.success === false || data?.success === 'false'
        // A pending one-time activation email is not a booking failure.
        const pendingActivation = failed && /activ/i.test(String(data?.message ?? ''))
        if (failed && !pendingActivation) {
          throw new Error('Booking could not be sent. Please try again or call the studio.')
        }
      } else {
        await new Promise((r) => setTimeout(r, 600))
        demoNote?.classList.remove('hidden')
      }

      document.getElementById('sum-code').textContent = code
      document.getElementById('sum-first').textContent = payload.name.split(' ')[0]
      document.getElementById('sum-session').textContent = payload.session
      document.getElementById('sum-when').textContent = `${formatDate(payload.date)} · ${payload.time}`
      document.getElementById('sum-location').textContent = payload.location
      document.getElementById('sum-name').textContent = payload.name

      panel.classList.add('hidden')
      successPanel.classList.remove('hidden')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      formError.textContent = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      formError.classList.remove('hidden')
      window.scrollTo({ top: formError.offsetTop - 100, behavior: 'smooth' })
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Confirm Appointment'
    }
  })

  document.getElementById('book-again')?.addEventListener('click', () => {
    form.reset()
    clearErrors()
    formError.classList.add('hidden')
    dateEl.min = today
    successPanel.classList.add('hidden')
    panel.classList.remove('hidden')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
