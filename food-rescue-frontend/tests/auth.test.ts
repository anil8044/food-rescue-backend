import assert from 'node:assert/strict'
import { test } from 'node:test'
import { startIdleTimer } from '../src/auth/idleTimer.ts'
import { IDLE_MS, safeReturnTo, canVisit } from '../src/auth/session.ts'

test('idle session expires at 600 seconds', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  let expired = 0
  const target = new EventTarget()
  const stop = startIdleTimer({ expiresAt: Date.now() + IDLE_MS, idleMs: IDLE_MS, activityTarget: target, visibilityTarget: target, refresh() {}, expire() { expired++ } })
  t.mock.timers.tick(599999)
  assert.equal(expired, 0)
  t.mock.timers.tick(1)
  assert.equal(expired, 1)
  target.dispatchEvent(new Event('click'))
  t.mock.timers.tick(IDLE_MS)
  assert.equal(expired, 1)
  stop()
})

test('each allowed interaction renews the timer; mouse movement does not', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  let expired = false
  let deadline = 0
  const target = new EventTarget()
  const stop = startIdleTimer({ expiresAt: Date.now() + IDLE_MS, idleMs: IDLE_MS, activityTarget: target, visibilityTarget: target, refresh(value) { deadline = value }, expire() { expired = true } })
  for (const type of ['click', 'keydown', 'touchstart', 'scroll']) {
    t.mock.timers.tick(100000)
    target.dispatchEvent(new Event(type))
    assert.equal(deadline, Date.now() + IDLE_MS)
  }
  target.dispatchEvent(new Event('mousemove'))
  t.mock.timers.tick(IDLE_MS - 1)
  assert.equal(expired, false)
  t.mock.timers.tick(1)
  assert.equal(expired, true)
  stop()
})

test('expired session cannot be renewed by late interaction', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })
  let expired = false
  let renewed = false
  const target = new EventTarget()
  startIdleTimer({ expiresAt: 999, idleMs: IDLE_MS, activityTarget: target, visibilityTarget: target, refresh() { renewed = true }, expire() { expired = true } })
  target.dispatchEvent(new Event('click'))
  assert.equal(expired, true)
  assert.equal(renewed, false)
})

test('return paths remain internal and respect roles', () => {
  assert.equal(safeReturnTo('//outside.example'), '/')
  assert.equal(safeReturnTo('/login'), '/')
  assert.equal(safeReturnTo('/recipient/reservations?sort=new#item'), '/recipient/reservations?sort=new#item')
  assert.equal(canVisit('/admin/incidents', 'RECIPIENT_ORG'), false)
  assert.equal(canVisit('/donor', 'DONOR'), true)
  assert.equal(canVisit('/recipient', 'RECIPIENT_ORG'), true)
  assert.equal(canVisit('/admin', 'ADMIN'), true)
})

