import { useState, useCallback, useMemo } from 'react'
import { calculatePrice, LANGUAGE_LABELS } from '../../../config/constants'

export default function useBookingForm() {
  const [fromLang, setFromLang] = useState('en')
  const [toLang, setToLang] = useState('es')
  const [sessionType, setSessionType] = useState('audio')
  const [duration, setDuration] = useState(30)
  const [step, setStep] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleSwapLanguages = useCallback(() => {
    setFromLang((prev) => {
      setToLang(prev)
      return toLang
    })
  }, [toLang])

  const pricing = useMemo(() => calculatePrice(duration), [duration])

  const languageLabel = useMemo(() => {
    const from = LANGUAGE_LABELS[fromLang] || fromLang
    const to = LANGUAGE_LABELS[toLang] || toLang
    return `${from} → ${to}`
  }, [fromLang, toLang])

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 3)), [])
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])

  return {
    fromLang, toLang, sessionType, duration, step, sheetOpen,
    setFromLang, setToLang, setSessionType, setDuration, setStep, setSheetOpen,
    handleSwapLanguages, nextStep, prevStep,
    pricing, languageLabel,
  }
}
