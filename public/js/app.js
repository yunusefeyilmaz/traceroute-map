locations = [];

var reloadIcon = document.getElementById("reload-icon");
hideReloadIcon();
// create a map in the "map" div, set the view to a given place and zoom
const map = L.map("map").setView([0, 0], 2);

// create a tile layer to add to our map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

function writeMap(locations) {
  // create a red polyline from an array of LatLng points
  var latlngs = locations.map((location) => [location[3], location[4]]);
  const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  // add markers
  for (var i = 0; i < locations.length; i++) {
    L.marker([locations[i][3], locations[i][4]])
      .addTo(map)
      .bindPopup(
        `<b>${"Hop: " + i}</b><br><b>${locations[i][0]}</b><br>${
          locations[i][1]
        }, ${locations[i][2]}<br>${locations[i][5]}<br>${locations[i][6]}<br>${
          locations[i][7]
        }`
      )
      .openPopup();
  }
  const polyline = L.polyline(latlngs, { color: randomColor }).addTo(map);
  polyline.setStyle({ color: randomColor });
  // add the polyline to the map
  map.fitBounds(polyline.getBounds());
}

var my_ip;
function getMyIpAddress() {
  fetch(`/api/ip-location?ip=`)
    .then((response) => response.json())
    .then((data) => {
      my_ip = data;
      document.getElementById(
        "your-ip-address"
      ).innerHTML = `Your IP: (${my_ip.ip})`;
    });
}
getMyIpAddress();

function hideReloadIcon() {
  reloadIcon.style.visibility = "hidden";
}
function showReloadIcon() {
  reloadIcon.style.visibility = "visible";
}
function resetMap() {
  locations = [];
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
  map.eachLayer(function (layer) {
    if (layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
}
// create a socket connection
const socket = io();
// listen for the form submit event
document.getElementById("traceForm").addEventListener("submit", function (e) {
  e.preventDefault();
  showReloadIcon();
  // get the destination value
  const destination = document.getElementById("destination").value;
  const results = document.getElementById("results");
  results.innerHTML = "";
  resetMap();
  // clear error report
  writeError("");
  if (my_ip) {
    locations.push([
      my_ip.city,
      my_ip.region,
      my_ip.country,
      my_ip.latitude,
      my_ip.longitude,
      my_ip.isp,
      my_ip.org,
      my_ip.query,
    ]);
    writeMap(locations);
  } else {
    writeError("Failed to get IP address");
  }
  // remove all popups from the map
  socket.disconnect();
  socket.connect();

  // emit the trace event
  socket.emit("trace", destination);
});

// listen for the location event
socket.on("location", function (location) {
  const results = document.getElementById("results");
  results.innerHTML += `<li class="arrow">${location.city}, ${location.region}, ${location.country}, ${location.latitude}, ${location.longitude}, ${location.isp}, ${location.org} (${location.ip}) (${location.hop.rtt1})</li>`;
  if (location.city !== "Private") {
    locations.push([
      location.city,
      location.region,
      location.country,
      location.latitude,
      location.longitude,
      location.isp,
      location.org,
      location.ip,
    ]);
    writeMap(locations);
  }
});

// listen for the trace-complete event
socket.on("trace-error", function (message) {
  hideReloadIcon();
  console.log("Trace Error:", message);
  writeError(message);
});

// listen for the location-error event
socket.on("location-error", function (message) {
  hideReloadIcon();
  console.log("Location Error:", message);
  writeError(message);
});

socket.on("trace-complete", function () {
  hideReloadIcon();
  console.log("Trace Complete");
  greenify();
});

function writeError(message) {
  document.getElementById("error-report").innerHTML = message;
}

function greenify() {
  const listItems = document.getElementsByTagName("li");
  for (let i = 0; i < listItems.length; i++) {
    listItems[i].style.color = "green";
  }
}
