import { describe, it, expect } from 'vitest'
import {
  calculatePrice,
  calculateInterpreterPay,
  calculateHoldCost,
  CLIENT_RATES,
  INTERPRETER_EARN_RATES,
  HOLD_TIERS,
  MIN_PAYOUT,
} from '../config/constants'

// ─── calculatePrice ──────────────────────────────────────────────────────────
describe('calculatePrice', () => {
  it('charges the correct audio rate per minute', () => {
    const { base, total } = calculatePrice(10, 'audio')
    expect(base).toBe(14.90)
    expect(total).toBe(14.90)
  })

  it('charges the correct video rate per minute', () => {
    const { base, total } = calculatePrice(10, 'video')
    expect(base).toBe(17.90)
    expect(total).toBe(17.90)
  })

  it('base and total are always equal (vault-model: no exposed platform fee)', () => {
    const durations = [5, 10, 15, 30, 45, 60]
    for (const mins of durations) {
      const { base, total } = calculatePrice(mins, 'audio')
      expect(base).toBe(total)
    }
  })

  it('defaults to audio rate when sessionType is unknown', () => {
    const { total } = calculatePrice(10, 'unknown')
    expect(total).toBe(calculatePrice(10, 'audio').total)
  })

  it('returns 0 for 0 minutes', () => {
    expect(calculatePrice(0, 'audio').total).toBe(0)
    expect(calculatePrice(0, 'video').total).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    // 7 min × $1.49 = $10.43
    const { total } = calculatePrice(7, 'audio')
    expect(total).toBe(10.43)
    // check it's a valid 2dp number
    expect(Number.isFinite(total)).toBe(true)
    expect(total.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2)
  })

  it('CLIENT_RATES alias matches DISPLAY_RATES used internally', () => {
    expect(CLIENT_RATES.audio).toBe(1.49)
    expect(CLIENT_RATES.video).toBe(1.79)
  })
})

// ─── calculateInterpreterPay ─────────────────────────────────────────────────
describe('calculateInterpreterPay', () => {
  it('pays the correct audio rate per minute', () => {
    expect(calculateInterpreterPay(10, 'audio')).toBe(4.50)
  })

  it('pays the correct video rate per minute', () => {
    expect(calculateInterpreterPay(10, 'video')).toBe(5.00)
  })

  it('interpreter pay is always less than client charge (spread kept internal)', () => {
    const durations = [5, 10, 15, 30, 60]
    for (const mins of durations) {
      for (const type of ['audio', 'video']) {
        const clientTotal = calculatePrice(mins, type).total
        const interpPay = calculateInterpreterPay(mins, type)
        expect(interpPay).toBeLessThan(clientTotal)
      }
    }
  })

  it('defaults to audio rate when sessionType is unknown', () => {
    expect(calculateInterpreterPay(10, 'unknown')).toBe(
      calculateInterpreterPay(10, 'audio')
    )
  })

  it('INTERPRETER_EARN_RATES are lower than CLIENT_RATES', () => {
    expect(INTERPRETER_EARN_RATES.audio).toBeLessThan(CLIENT_RATES.audio)
    expect(INTERPRETER_EARN_RATES.video).toBeLessThan(CLIENT_RATES.video)
  })

  it('rounds to 2 decimal places', () => {
    // 7 min × $0.45 = $3.15 (exact) — test with a messier number
    // 3 min × $0.45 = $1.35
    const pay = calculateInterpreterPay(3, 'audio')
    expect(pay).toBe(1.35)
  })
})

// ─── calculateHoldCost ───────────────────────────────────────────────────────
describe('calculateHoldCost', () => {
  describe('audio hold tiers', () => {
    it('charges $0 for the first 5 minutes of hold (grace period)', () => {
      expect(calculateHoldCost(5, 'audio')).toBe(0)
      expect(calculateHoldCost(3, 'audio')).toBe(0)
      expect(calculateHoldCost(1, 'audio')).toBe(0)
    })

    it('charges $0.65/min for hold minutes 6–10', () => {
      // 5 min free + 5 min at $0.65 = $3.25
      expect(calculateHoldCost(10, 'audio')).toBe(3.25)
    })

    it('charges $1.49/min for hold beyond 10 minutes', () => {
      // 5 min free + 5 min at $0.65 ($3.25) + 5 min at $1.49 ($7.45) = $10.70
      expect(calculateHoldCost(15, 'audio')).toBe(10.70)
    })
  })

  describe('video hold tiers', () => {
    it('charges $0 for the first 5 minutes of hold', () => {
      expect(calculateHoldCost(5, 'video')).toBe(0)
    })

    it('charges $0.75/min for hold minutes 6–10', () => {
      // 5 min free + 5 min at $0.75 = $3.75
      expect(calculateHoldCost(10, 'video')).toBe(3.75)
    })

    it('charges $1.79/min for hold beyond 10 minutes', () => {
      // 5 free + 5 × $0.75 ($3.75) + 5 × $1.79 ($8.95) = $12.70
      expect(calculateHoldCost(15, 'video')).toBe(12.70)
    })
  })

  it('returns 0 for 0 hold minutes', () => {
    expect(calculateHoldCost(0, 'audio')).toBe(0)
    expect(calculateHoldCost(0, 'video')).toBe(0)
  })

  it('defaults to audio tiers when sessionType is unknown', () => {
    expect(calculateHoldCost(10, 'unknown')).toBe(
      calculateHoldCost(10, 'audio')
    )
  })

  it('HOLD_TIERS grace period is consistent between audio and video', () => {
    // Both types should have the same 5-minute free grace period
    expect(HOLD_TIERS.audio[0]).toMatchObject({ upTo: 5, rate: 0.00 })
    expect(HOLD_TIERS.video[0]).toMatchObject({ upTo: 5, rate: 0.00 })
  })

  it('rounds to 2 decimal places', () => {
    const cost = calculateHoldCost(7, 'audio')
    // 5 free + 2 × $0.65 = $1.30
    expect(cost).toBe(1.30)
  })
})

// ─── MIN_PAYOUT sanity ───────────────────────────────────────────────────────
describe('MIN_PAYOUT', () => {
  it('is a positive number', () => {
    expect(MIN_PAYOUT).toBeGreaterThan(0)
  })

  it('is reachable within a reasonable number of sessions', () => {
    // A full 60-min audio session earns $0.45×60 = $27 — 2 sessions covers it
    const earningsPerHourAudio = calculateInterpreterPay(60, 'audio')
    const sessionsNeeded = Math.ceil(MIN_PAYOUT / earningsPerHourAudio)
    expect(sessionsNeeded).toBeLessThanOrEqual(10)
  })
})
