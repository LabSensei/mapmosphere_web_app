const json_url = 'http://172.19.101.41:3000/books';
getData();
let mygeojson = { "type": "FeatureCollection", "features": [] }
async function getData() {
    await fetch(json_url)
        .then(response => response.json())
        .then(data => {
            for (let point of data) {
                let coordinate = [parseFloat(point.tags2), parseFloat(point.tags1)];
                let properties = point;
                delete properties.tags2;
                delete properties.tags1;
                let feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": coordinate
                    },
                    "properties": properties
                }
                mygeojson.features.push(feature);
            }
        });
    console.log(mygeojson);
    // console.log(mygeojson);
}
mapboxgl.accessToken = 'pk.eyJ1IjoieXVpbHRyIiwiYSI6ImNreXB2cmg4MDBlMmkybnFqdnFyejRjemoifQ.xfr3tk7f8lpmWdAOERT2xg'
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [85.32, 27.71], // starting position [lng, lat]
    zoom: 6, // starting zoom
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
            data: mygeojson
                // data: mygeojson
        });
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

        // When a click event occurs on a feature in the points layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'points', (e) => {
            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const title = e.features[0].properties.title;
            const properties = e.features[0].properties;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML('Coordinates :<br/>' + coordinates)
                .addTo(map);

            // Information Display
            let stringOutput = "";
            const keyValue = (input) => Object.entries(input).forEach(([key, value]) => {
                let tempString = '<li class="list-group-item"><div class="row"><div class="col-md-2">' + key + '</div><div class="col-md-10">' + value.toString() + '</div></div></li>'
                    // tempString.append("<div>", key, "</div><div>", value, "</div>");
                    // console.log(tempString);
                    // console.log(key, value.toString());
                    //   stringOutput.append(tempString)
                stringOutput += tempString;
                //   count++;
            });
            keyValue(properties);
            console.log(stringOutput);
            document.getElementById("pinInfo").innerHTML = stringOutput;
        });
        // Change the cursor to a pointer when the mouse is over the points layer.
        map.on('mouseenter', 'points', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'points', () => {
            map.getCanvas().style.cursor = '';
        });
    })
})