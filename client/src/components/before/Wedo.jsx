import React from "react";

export default function Wedo() {
  const images = [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1520975919411-3a9f29b5f3c8?auto=format&fit=crop&w=800&q=60"
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
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              height: 140,
              display: "flex",
              alignItems: "stretch"
            }}
          >
            <img
              src={src}
              alt={`fabric ${i + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
            />
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
