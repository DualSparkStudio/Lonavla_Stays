-- Replace all facilities with the current villa amenity list.
DELETE FROM public.facilities;

INSERT INTO public.facilities (name, description, image, hours) VALUES
  (
    'Carrom',
    'Indoor carrom board for relaxed family game nights at the villa.',
    'https://images.unsplash.com/photo-1611190103353-8fefb6d32c58?w=800&h=500&fit=crop',
    'Included with stay'
  ),
  (
    'Badminton',
    'Badminton setup for outdoor play—rackets and shuttle available at the property.',
    'https://images.unsplash.com/photo-1626224583764-f87db4ac00ea?w=800&h=500&fit=crop',
    'Included with stay'
  ),
  (
    'Cricket',
    'Space and equipment for a friendly cricket match during your stay.',
    'https://images.unsplash.com/photo-1531410400050-ca32ddb38f54?w=800&h=500&fit=crop',
    'Included with stay'
  ),
  (
    'Swimming Pool',
    'Private swimming pool for guests—perfect for a refreshing dip in the hills.',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop',
    'Included with stay'
  ),
  (
    'Refrigerator | Water Purifier',
    'Fully equipped kitchen with refrigerator and RO water purifier for safe drinking water.',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=500&fit=crop',
    'Included with stay'
  ),
  (
    'Caretaker Available',
    'On-site caretaker support to help with your stay and day-to-day needs at the villa.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=500&fit=crop',
    'During your stay'
  ),
  (
    'BBQ Grill (On Request)',
    'Barbecue grill arranged on request for outdoor dining and grill nights.',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop',
    'On request'
  ),
  (
    'Portable Speaker',
    'Portable Bluetooth speaker for music on the terrace, by the pool, or indoors.',
    'https://images.unsplash.com/photo-1545454675-3531b543f6b4?w=800&h=500&fit=crop',
    'Included with stay'
  ),
  (
    '32" Smart TV | Free Wi-Fi',
    '32-inch smart TV with streaming apps and complimentary high-speed Wi-Fi throughout the villa.',
    'https://images.unsplash.com/photo-1593359677873-a886bb46f1ef?w=800&h=500&fit=crop',
    'Included with stay'
  );
