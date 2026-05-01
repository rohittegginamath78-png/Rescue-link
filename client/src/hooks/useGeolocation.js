import { useCallback, useState } from 'react'
import { normalizeCity } from '../utils/formatters'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [city, setCity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState('prompt')

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      const cityName =
        data.address?.city ||
        data.address?.suburb ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        'Unknown'

      return normalizeCity(cityName)
    } catch {
      return null
    }
  }, [])

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        })
      })

      const { latitude, longitude } = position.coords
      setLocation({ lat: latitude, lng: longitude })

      const cityName = await reverseGeocode(latitude, longitude)
      if (cityName) {
        setCity(cityName)
      }

      setPermission('granted')
      return { lat: latitude, lng: longitude, city: cityName }
    } catch (err) {
      if (err.code === 1) {
        setPermission('denied')
        setError('Location permission denied. You can enter your city manually instead.')
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again.')
      } else {
        setError('Unable to get your location. Please try again.')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [reverseGeocode])

  const setManualCity = useCallback((cityName) => {
    setCity(normalizeCity(cityName))
  }, [])

  return {
    location,
    city,
    loading,
    error,
    permission,
    requestLocation,
    setManualCity,
  }
}
