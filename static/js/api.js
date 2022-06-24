const json_url = 'http://172.19.101.41:3000/books';
getData();
async function getData() {
    let mygeojson = { "type": "FeatureCollection", "features": [] }
    await fetch(json_url)
        .then(response => response.json())
        .then(data => {
            for (let point of data) {
                let coordinate = [parseFloat(point.longitude), parseFloat(point.latitude)];
                let properties = point;
                delete properties.longitude;
                delete properties.latitude;
                let feature = { "type": "Feature", "geometry": { "type": "Point", "coordinates": coordinate }, "properties": properties }
                mygeojson.features.push(feature);
            }
        });
    console.log(mygeojson);
}