export const expectedHazardhubResponse = {
    address: '123 Main St',
    state: 'TX',
    zip: '75201',
    lat: 33.021,
    lng: -96.698,
    locationType: 'ADDRESS',
};

export const mockHazardhubData = {
    risks: {
        address: expectedHazardhubResponse.address,
        state: expectedHazardhubResponse.state,
        zip: expectedHazardhubResponse.zip,
        lat: expectedHazardhubResponse.lat,
        lng: expectedHazardhubResponse.lng,
        locationType: expectedHazardhubResponse.locationType,
    },
    enchancedProperty: {},
};
