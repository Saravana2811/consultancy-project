import React from "react";
import "./Location.css";

export default function Location() {
  const MAP_Q = "11.3430139,77.721433";

  return (
    <section className="location-section">
      <div className="location-inner">
        <div className="location-info">
          <h2 className="location-title">Our Location</h2>
          <p className="location-sub">Visit our main facility and showroom.</p>

          <div className="location-card">
            <h3>Prema Textile Mills</h3>
            <p>123 Textile Road(Oppo to Sri Muthu Tex), Erode, Tamil Nadu, India</p>
            <p>Phone: +91 94435 34549</p>
            <p>Email: contact@prema-textiles.example</p>
            <div className="location-hours">
              <strong>Hours:</strong>
              <span>Mon–Sat: 10:00am — 8:30pm</span>
            </div>

            <a
              className="location-cta"
              href={`https://www.google.com/maps?q=${MAP_Q}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </div>
        </div>

        <div className="location-map">
          <div className="map-container">
            <iframe
              title="Prema Textile Mills map"
              src={`https://www.google.com/maps?q=${MAP_Q}&z=17&output=embed`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            
          </div>
        </div>
      </div>
    </section>
  );
}
