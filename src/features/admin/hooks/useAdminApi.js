import { useState, useEffect } from 'react'

export function useAdminApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = () => {
    setIsLoading(true)
    fetcher()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { refetch() }, deps)

  return { data, isLoading, error, refetch }
}
