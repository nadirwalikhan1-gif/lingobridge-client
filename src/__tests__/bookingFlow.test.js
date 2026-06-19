import { describe, it, expect } from 'vitest'
import {
  CLIENT_RATES,
  HOLD_TIERS,
  calculatePrice,
  calculateHoldCost,
} from '../config/constants'

// ─────────────────────────────────────────────────────────────────────────────
// These tests validate the booking page's pricing logic, which previously had
// hardcoded wrong rates ($0.99/$1.20 audio/video). The vault-model rates
// ($1.49/$1.79) are now enforced here so a rate change produces a test failure
// before it reaches production.
//
// The holdCostPreview function from BookingPage.jsx is re-implemented here as
// a pure function (it IS a pure function in the page, just not exported).
// If BookingPage.jsx's holdCostPreview logic changes, update this too.
// ─────────────────────────────────────────────────────────────────────────────

function holdCostPreview(holdMinutes, sessionType) {
  const tiers = HOLD_TIERS[sessionType || 'audio']
  let cost = 0, cursor = 0
  for (const tier of tiers) {
    if (cursor >= holdMinutes) break
    const tierEnd = Math.min(holdMinutes, tier.upTo)
    const minutesInTier = tierEnd - cursor
    if (minutesInTier > 0) cost += minutesInTier * tier.rate
    cursor = tierEnd
  }
  return cost.toFixed(2)
}

// ─── Rate regression guard ────────────────────────────────────────────────────
describe('Booking rates — vault-model regression guard', () => {
  it('audio rate is $1.49/min', () => {
    expect(CLIENT_RATES.audio).toBe(1.49)
  })

  it('video rate is $1.79/min', () => {
    expect(CLIENT_RATES.video).toBe(1.79)
  })

  it('audio is cheaper than video', () => {
    expect(CLIENT_RATES.audio).toBeLessThan(CLIENT_RATES.video)
  })

  it('old rates ($0.99/$1.20) are gone', () => {
    expect(CLIENT_RATES.audio).not.toBe(0.99)
    expect(CLIENT_RATES.video).not.toBe(1.20)
  })
})

// ─── Session total pricing ────────────────────────────────────────────────────
describe('Session total calculation', () => {
  const cases = [
    { mins: 5,  type: 'audio', expected: 7.45 },
    { mins: 10, type: 'audio', expected: 14.90 },
    { mins: 15, type: 'audio', expected: 22.35 },
    { mins: 30, type: 'audio', expected: 44.70 },
    { mins: 60, type: 'audio', expected: 89.40 },
    { mins: 5,  type: 'video', expected: 8.95 },
    { mins: 10, type: 'video', expected: 17.90 },
    { mins: 30, type: 'video', expected: 53.70 },
    { mins: 60, type: 'video', expected: 107.40 },
  ]

  cases.forEach(({ mins, type, expected }) => {
    it(`${mins} min ${type} session costs $${expected}`, () => {
      expect(calculatePrice(mins, type).total).toBe(expected)
    })
  })
})

// ─── Hold cost preview ────────────────────────────────────────────────────────
describe('holdCostPreview', () => {
  it('returns "0.00" for 0 hold minutes', () => {
    expect(holdCostPreview(0, 'audio')).toBe('0.00')
  })

  it('returns "0.00" for hold within the 5-min grace period', () => {
    expect(holdCostPreview(4, 'audio')).toBe('0.00')
    expect(holdCostPreview(5, 'audio')).toBe('0.00')
  })

  it('charges correctly for hold in the 6–10 min tier (audio)', () => {
    // 5 free + 3 × $0.65 = $1.95
    expect(holdCostPreview(8, 'audio')).toBe('1.95')
  })

  it('charges correctly for hold beyond 10 minutes (audio)', () => {
    // 5 free + 5 × $0.65 + 5 × $1.49 = $0 + $3.25 + $7.45 = $10.70
    expect(holdCostPreview(15, 'audio')).toBe('10.70')
  })

  it('charges correctly for hold in the 6–10 min tier (video)', () => {
    // 5 free + 3 × $0.75 = $2.25
    expect(holdCostPreview(8, 'video')).toBe('2.25')
  })

  it('returns a string with exactly 2 decimal places', () => {
    const result = holdCostPreview(7, 'audio')
    expect(typeof result).toBe('string')
    expect(result).toMatch(/^\d+\.\d{2}$/)
  })

  it('is consistent with calculateHoldCost for the same inputs', () => {
    const testCases = [0, 3, 5, 7, 10, 12, 20]
    for (const mins of testCases) {
      const preview = holdCostPreview(mins, 'audio')
      const canonical = calculateHoldCost(mins, 'audio').toFixed(2)
      expect(preview).toBe(canonical)
    }
  })
})

// ─── Insufficient-funds guard ─────────────────────────────────────────────────
describe('Insufficient-funds guard (wallet payment)', () => {
  // Mirrors BookingPage.jsx logic:
  //   walletCoversTotal    = total <= WALLET_BALANCE
  //   hasInsufficientFunds = selectedPayment === 'wallet' && !walletCoversTotal

  function insufficientFunds(total, walletBalance, paymentMethod) {
    const walletCoversTotal = total <= walletBalance
    return paymentMethod === 'wallet' && !walletCoversTotal
  }

  it('flags insufficient funds when wallet balance is too low', () => {
    const total = calculatePrice(30, 'audio').total  // $44.70
    expect(insufficientFunds(total, 20.00, 'wallet')).toBe(true)
  })

  it('does not flag when wallet balance covers the total', () => {
    const total = calculatePrice(5, 'audio').total   // $7.45
    expect(insufficientFunds(total, 50.00, 'wallet')).toBe(false)
  })

  it('does not flag when balance exactly equals the total', () => {
    const total = calculatePrice(10, 'audio').total  // $14.90
    expect(insufficientFunds(total, 14.90, 'wallet')).toBe(false)
  })

  it('never flags insufficient funds when payment method is not wallet', () => {
    const total = calculatePrice(60, 'video').total  // $107.40
    expect(insufficientFunds(total, 0, 'card')).toBe(false)
    expect(insufficientFunds(total, 0, 'corporate')).toBe(false)
  })
})

// ─── Step navigation limits ───────────────────────────────────────────────────
describe('Booking step navigation', () => {
  // Mirrors BookingPage.jsx:
  //   advance = () => setStep(s => Math.min(7, s + 1))
  //   goBack  = () => setStep(s => Math.max(1, s - 1))

  const advance = (step) => Math.min(7, step + 1)
  const goBack  = (step) => Math.max(1, step - 1)

  it('advance cannot go past step 7', () => {
    expect(advance(7)).toBe(7)
    expect(advance(6)).toBe(7)
  })

  it('goBack cannot go below step 1', () => {
    expect(goBack(1)).toBe(1)
    expect(goBack(2)).toBe(1)
  })

  it('advance increments normally within bounds', () => {
    for (let s = 1; s <= 6; s++) {
      expect(advance(s)).toBe(s + 1)
    }
  })

  it('goBack decrements normally within bounds', () => {
    for (let s = 2; s <= 7; s++) {
      expect(goBack(s)).toBe(s - 1)
    }
  })

  it('handleStepJump only allows jumping to a previous step', () => {
    // Mirrors: if (targetStep < step) allow jump, otherwise ignore
    const canJump = (targetStep, currentStep) => targetStep < currentStep
    expect(canJump(2, 5)).toBe(true)   // can jump back
    expect(canJump(5, 5)).toBe(false)  // same step — no jump
    expect(canJump(6, 5)).toBe(false)  // forward — no jump
  })
})
