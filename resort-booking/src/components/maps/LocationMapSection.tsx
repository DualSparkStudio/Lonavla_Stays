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

  if (!hasMap || !mapsUrl) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl text-gray-900">{title}</h2>

      {embedUrl && (
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
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-base font-medium text-airbnb-red hover:underline"
      >
        {embedUrl ? 'Open in Google Maps' : `View ${displayAddress} on Google Maps`}
      </a>
    </section>
  );
};

export default LocationMapSection;
