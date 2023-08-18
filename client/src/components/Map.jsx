import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

import { renderToStaticMarkup } from 'react-dom/server';
const Map = ({ shopLocations, selectedShops }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);
  const originalZoomRef = useRef(null);

  useEffect(() => {
    mapRef.current = L.map('map', {
      center: [35.29778928551384 ,-119.0586018562317],
      zoom: 18,
      minZoom:  window.innerWidth<786?18:19,
      maxZoom: 22,
    });
    mapRef.current.on('dblclick', handleMapClick);
    const imageUrl = '/map.png'; // Provide the correct image URL here
    const imageBounds = [
      [35.2982613112835, -119.05961506068708], // Top-left coordinate
      [35.29831850146511, -119.05779015272857], // Top-right coordinate
      [35.29746091813723, -119.05795544385911], // Bottom-right coordinate
      [35.297285241043646, -119.05964925885202], // Bottom-left coordinate
    ]; 
    

   
    const imageOverlayOptions = {
      opacity: 1, // Adjust the opacity as needed
      interactive: false // Disable interaction with the imageOverlay
    };

    const imageOverlay = L.imageOverlay(imageUrl, imageBounds, imageOverlayOptions);

    // Fit the image to the bounds while maintaining the aspect ratio
    const fitImageToBounds = () => {
      const overlay = imageOverlay._overlay;
    
      if (overlay) {
        const image = overlay._image;
    
        if (image) {
          const bounds = overlay._bounds;
          const boundsWidth = bounds.max.x - bounds.min.x;
          const boundsHeight = bounds.max.y - bounds.min.y;
          const boundsAspectRatio = boundsWidth / boundsHeight;
    
          const imageWidth = image.naturalWidth;
          const imageHeight = image.naturalHeight;
          const imageAspectRatio = imageWidth / imageHeight;
    
          if (boundsAspectRatio > imageAspectRatio) {
            image.style.width = '100%';
            image.style.height = 'auto';
    
            const overlayContainer = image.parentNode;
            overlayContainer.style.height = image.offsetHeight + 'px';
          } else {
            image.style.width = 'auto';
            image.style.height = '100%';
    
            const overlayContainer = image.parentNode;
            overlayContainer.style.height = '100%';
          }
        }
      }
    };
    // Add the imageOverlay to the map
    mapRef.current.addLayer(imageOverlay);

    // Call the fitImageToBounds function initially and whenever the window is resized
    fitImageToBounds();
    window.addEventListener('resize', fitImageToBounds);

    originalZoomRef.current = mapRef.current.getZoom();

    return () => {
      window.removeEventListener('resize', fitImageToBounds);
      mapRef.current.removeLayer(imageOverlay);
      mapRef.current.remove();
    };
    
  }, []);

  useEffect(() => {
    // Remove existing markers that are no longer selected
    markersRef.current.forEach(marker => {
      if (!selectedShops.some(shop => shop.latitude === marker.getLatLng().lat && shop.longitude === marker.getLatLng().lng)) {
        mapRef.current.removeLayer(marker);
      }
    });

    // Add markers for selected shops
    selectedShops.forEach(shop => {
      const existingMarker = markersRef.current.find(marker =>
        shop.latitude === marker.getLatLng().lat && shop.longitude === marker.getLatLng().lng
      );

      if (!existingMarker) {
        const { latitude, longitude, name, items, image } = shop;
        const markerIcon = L.divIcon({
          className: 'map-marker-icon',
          html: `<div class="marker-icon">${renderToStaticMarkup(<FaMapMarkerAlt  color="blue" size="30px"/>)}</div>`,
        });
        const popupContent = `
          <div class="custom-popup">
            <span class="items">
              ${items.map(item => `<div key="${item.name}">
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
              </div>`).join('')}
            </span>
            <button class="image-button" onclick="openGallery('${image.url}')">View Image</button>
          </div>
        `;
        const marker = L.marker([latitude, longitude],{ icon: markerIcon }).addTo(mapRef.current);
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
        marker.openPopup(); // Open the popup for the marker
      } else {
        // If the marker already exists, add it back to the map
        mapRef.current.addLayer(existingMarker);
      }
    });
  }, [selectedShops]);

  useEffect(() => {
    const handleZoom = () => {
      const zoomLevel = mapRef.current.getZoom();

      if (zoomLevel === mapRef.current.getMaxZoom()) {
        // Show all circles
        shopLocations.forEach(shop => {
          const circle = L.circleMarker([shop.latitude, shop.longitude], { radius: 5 })
            .addTo(mapRef.current)
            .on('click', (event) => {
              const circle = event.target;
              const { name, items, image } = shop;
              const popupContent = `
                <div class="custom-popup">
                  <span class="items">
                    ${items.map(item => `<div key="${item.name}">
                      <h3>${item.name}</h3>
                      <p>$${item.price}</p>
                    </div>`).join('')}
                  </span>
                  <button class="image-button" onclick="openGallery('${image.url}')">View Image</button>
                </div>
              `;
              circle.bindPopup(popupContent).openPopup();
            });

          circlesRef.current.push(circle);
        });
      } else {
        // Hide circles
        circlesRef.current.forEach(circle => mapRef.current.removeLayer(circle));
        circlesRef.current = [];
      }
    };

    mapRef.current.on('zoomend', handleZoom);

    return () => {
      mapRef.current.off('zoomend', handleZoom);
    };
  }, [shopLocations]);

  useEffect(() => {
    if (selectedShops.length === 1) {
      const shop = selectedShops[0];
      mapRef.current.setView([shop.latitude, shop.longitude], 21);
    } else {
      mapRef.current.setView(mapRef.current.getCenter(), originalZoomRef.current);
    }
  }, [selectedShops]);
  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    const coordinates = `${lat} ${lng}`;
  
    // Save the coordinates to the clipboard
   const password= window.localStorage.getItem("adminPassword")
   if(password && password=="aqibnawab"){
    navigator.clipboard.writeText(coordinates)
    alert("Location Copied To Clip Board")
   }
  };


  // Function to open the image gallery in full-screen
  window.openGallery = (imageUrl) => {
    const galleryContent = `
      <div class="image-gallery">
        <div class="image-wrapper">
          <img src="${imageUrl}" alt="Gallery Image" />
          <button class="close-button">X</button>
        </div>
      </div>
    `;

    const galleryContainer = L.DomUtil.create('div');
    galleryContainer.innerHTML = galleryContent;

    L.DomEvent.disableScrollPropagation(galleryContainer);
    L.DomEvent.disableClickPropagation(galleryContainer);

    const closeBtn = galleryContainer.querySelector('.close-button');
    closeBtn.addEventListener('click', window.closeGallery);

    const galleryWrapper = document.createElement('div');
    galleryWrapper.classList.add('gallery-wrapper');
    galleryWrapper.appendChild(galleryContainer);

    const mapContainer = mapRef.current.getContainer();
    const mapWrapper = mapContainer.parentNode;
    mapWrapper.appendChild(galleryWrapper);
  };

  // Function to close the image gallery
  window.closeGallery = () => {
    const galleryWrapper = document.querySelector('.gallery-wrapper');
    if (galleryWrapper) {
      galleryWrapper.parentNode.removeChild(galleryWrapper);
    }
  };

  return <div id="map" className="map-container" />;
};

export default Map;
