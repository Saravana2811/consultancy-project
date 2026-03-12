import React from "react";
import p2 from "../../assets/photo2.jpg";
import p3 from "../../assets/photo3.jpg"; 

export default function Wedo() {
  const images = [
    { src: p2, alt: '220gram-1st Quality(1m)' },
    { src: p3, alt: '220gram-2nd Quality(1m)' },
    { src: p2, alt: '250gram(1m)' },
    { src: p3, alt: '200gram(1m)' },
  ];

  return (
    <section
      aria-label="Fabrics we dye"
      style={{
        maxWidth: 1200,
        margin: "36px auto",
        padding: "0 24px",
        boxSizing: "border-box"
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: 600,
          margin: "0 0 18px 0"
        }}
      >
        Materials We Dye
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          alignItems: "start"
        }}
      >
        {images.map((item, i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ height: 140, display: 'flex', alignItems: 'stretch' }}>
              <img
                src={item.src}
                alt={item.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block"
                }}
              />
            </div>
            <div style={{ padding: 10, background: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.alt}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#4b5563' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          section[aria-label="Fabrics we dye"] > div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          section[aria-label="Fabrics we dye"] > div {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
