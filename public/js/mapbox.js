export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaWdvcnBhaSIsImEiOiJja2xudnNrdjUwbTRsMnZtc3c2cmZpMW14In0.-S0wg9q4VPgLN4HMirQw8w';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/igorpai/cklnwei141b6v17lf2vb6wxy6',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 4
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        new mapboxgl.Popup({
                offset: 30
            }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map)

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}