import React from 'react';
import { resolveGoogleMapsOpenUrl, resolveMapsDisplay } from '../../lib/googleMaps';

type LocationMapSectionProps = {
  title?: string;
  mapEmbedUrl?: string;
  mapsLink?: string;
  address: string;
  location: string;
};

const LocationMapSection: React.FC<LocationMapSectionProps> = ({
  title = 'Location & directions',
  mapEmbedUrl,
  mapsLink,
  address,
  location,
}) => {
  const { embedUrl, hasMap } = resolveMapsDisplay(mapEmbedUrl, address, location, mapsLink);
  const mapsUrl = resolveGoogleMapsOpenUrl(mapEmbedUrl, address, location, mapsLink);
  const displayAddress = address || location;
  const guestMapsLink = mapsLink?.trim() ?? '';

  if (!hasMap || !mapsUrl) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl">{title}</h2>

      {embedUrl && (
        <div className="space-y-2">
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
            <iframe
              title={`Map — ${location}`}
              src={embedUrl}
              className="w-full h-44 sm:h-48 md:h-52 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          {guestMapsLink && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-sm text-gray-600 hover:text-airbnb-red hover:underline"
            >
              {guestMapsLink}
            </a>
          )}
        </div>
      )}

      {!embedUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-base font-medium text-airbnb-red hover:underline"
        >
          {guestMapsLink || `View ${displayAddress} on Google Maps`}
        </a>
      )}

      {embedUrl && !guestMapsLink && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-base font-medium text-airbnb-red hover:underline"
        >
          Open in Google Maps
        </a>
      )}
    </section>
  );
};

export default LocationMapSection;
