import { getGoogleMapsDirectionsUrl, getWhatsAppLink } from '../../utils/formatters'
import Badge from '../ui/Badge'
import Pill from '../ui/Pill'

export default function RescuerCard({ rescuer }) {
  const specialties = rescuer.specialties?.includes('all')
    ? ['birds', 'mammals', 'reptiles']
    : rescuer.specialties || []

  return (
    <div className="card">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-gray-900">{rescuer.name}</h3>
          
        </div>
        {rescuer.available24hr && <Badge tone="green">24hr</Badge>}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {specialties.map((specialty) => (
          <Pill key={specialty} tone="gray" className="cursor-default">
            {specialty}
          </Pill>
        ))}
      </div>

      <div className="mb-4 space-y-2">
        {rescuer.address && <p className="text-xs text-gray-600">{rescuer.address}</p>}
        {rescuer.phone && <p className="text-xs text-gray-600">Phone: {rescuer.phone}</p>}
        {!rescuer.phone && rescuer.whatsapp && (
          <p className="text-xs text-gray-600">WhatsApp only: {rescuer.whatsapp}</p>
        )}
        {rescuer.matchedCity && rescuer.requestedCity && rescuer.matchedCity !== rescuer.requestedCity && (
          <p className="text-xs text-amber-700">Showing nearest verified coverage from {rescuer.matchedCity}.</p>
        )}
      </div>

      <div className="flex gap-2">
        {rescuer.phone && (
          <a href={`tel:${rescuer.phone}`} className="flex-1 btn-secondary text-center text-xs">
            Call
          </a>
        )}
        {rescuer.whatsapp && (
          <a
            href={getWhatsAppLink(rescuer.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 btn-primary text-center text-xs"
          >
            WhatsApp
          </a>
        )}
        {rescuer.lat && rescuer.lng && (
          <a
            href={getGoogleMapsDirectionsUrl(rescuer.lat, rescuer.lng)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 btn-secondary text-center text-xs"
          >
            Directions
          </a>
        )}
      </div>
    </div>
  )
}
