mapboxgl.accessToken = 'pk.eyJ1IjoieXVpbHRyIiwiYSI6ImNreXB2cmg4MDBlMmkybnFqdnFyejRjemoifQ.xfr3tk7f8lpmWdAOERT2xg'
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [85.32, 27.71], // starting position [lng, lat]
    zoom: 12, // starting zoom
})

// Add the control to the map.
map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
        })
    )
    /* Given a query in the form "lng, lat" or "lat, lng"
     * returns the matching geographic coordinate(s)
     * as search results in carmen geojson format,
     * https://github.com/mapbox/carmen/blob/master/carmen-geojson.md */
const coordinatesGeocoder = function(query) {
    // Match anything which looks like
    // decimal degrees coordinate pair.
    const matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i)
    if (!matches) {
        return null
    }

    function coordinateFeature(lng, lat) {
        return {
            center: [lng, lat],
            geometry: {
                type: 'Point',
                coordinates: [lng, lat],
            },
            place_name: 'Lat: ' + lat + ' Lng: ' + lng,
            place_type: ['coordinate'],
            properties: {},
            type: 'Feature',
        }
    }

    const coord1 = Number(matches[1])
    const coord2 = Number(matches[2])
    const geocodes = []

    if (coord1 < -90 || coord1 > 90) {
        // must be lng, lat
        geocodes.push(coordinateFeature(coord1, coord2))
    }

    if (coord2 < -90 || coord2 > 90) {
        // must be lat, lng
        geocodes.push(coordinateFeature(coord2, coord1))
    }

    if (geocodes.length === 0) {
        // else could be either lng, lat or lat, lng
        geocodes.push(coordinateFeature(coord1, coord2))
        geocodes.push(coordinateFeature(coord2, coord1))
    }

    return geocodes
}

// Add the control to the map.
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: coordinatesGeocoder,
        zoom: 4,
        placeholder: 'Try: -40, 170',
        mapboxgl: mapboxgl,
        reverseGeocode: true,
    })
)

map.addControl(new mapboxgl.FullscreenControl())

map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
    })
)

const scale = new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'imperial',
})
map.addControl(scale)

scale.setUnit('metric')

map.on('load', () => {
    // Add an image to use as a custom marker
    map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
        if (error) throw error
        map.addImage('custom-marker', image)
            // Add a GeoJSON source with 2 points
        map.addSource('points', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    // {
                    //   // feature for Bhadrakali
                    //   type: 'Feature',
                    //   geometry: {
                    //     type: 'Point',
                    //     coordinates: [85.31803723700848, 27.69799486867092],
                    //   },
                    //   properties: {
                    //     title: 'Bhadrakali',
                    //   },
                    // },
                    {
                        // feature for Marriot
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [85.32375517550032, 27.7123552519937],
                        },
                        properties: {
                            title: 'Marriot',
                        },
                    },
                ],
            },
        })

        // Add a symbol layer
        map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points',
            layout: {
                'icon-image': 'custom-marker',
                // get the title name from the source's "title" property
                'text-field': ['get', 'title'],
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 1.25],
                'text-anchor': 'top',
            },
        })
    })
})