L.mapbox.accessToken = 'pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g';
var map = L.mapbox.map('map', 'mapbox.streets').setView([38.91338, -77.03236], 16);

streetsBasemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g', {
    maxZoom: 18,
    minZoom: 6,
    zIndex: 1,
    id: 'mapbox.streets'
}).addTo(map);

map.on('click', addMarker);

function addMarker(e) {
    if (typeof circleMarker !== "undefined") {
        map.removeLayer(circleMarker);
    }
    //add marker
    circleMarker = new L.circle(e.latlng, 200, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map);
}