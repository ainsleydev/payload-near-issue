import type { CollectionConfig } from 'payload'

export const Centres: CollectionConfig = {
    slug: 'centres',
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'location',
            type: 'group',
            fields: [
                {
                    name: 'coordinates',
                    type: 'point',
                    required: true,
                }
            ]
        },
        {
            name: 'nearbyCentres',
            label: 'Nearby Centres',
            type: 'relationship',
            relationTo: 'centres',
            virtual: true,
            hasMany: true,
            admin: {
                readOnly: false,
            },
            hooks: {
                afterRead: [
                    async ({data, req, depth}) => {
                        if (!data || depth !== 0) {
                            return;
                        }

                        const coords = data.location.coordinates;

                        try {
                            const centres = await req.payload.find({
                                req,
                                collection: 'centres',
                                limit: 4,
                                pagination: false,
                                where: {
                                    and: [
                                        {
                                            'location.coordinates': {
                                                //near: `${coords[0]},${coords[1]},null,0`,
                                                near: [
                                                    coords[0],
                                                    coords[1],
                                                    null,
                                                    0,
                                                ]
                                            },
                                        },
                                        {
                                            id: {
                                                not_equals: data.id,
                                            }
                                        },
                                    ]
                                },
                            });

                            return centres.docs;
                        } catch (err) {
                            req.payload.logger.error(`Obtaining nearby centres ${err}`);
                        }
                    }
                ]
            }
        },
    ],
    upload: true,
}
