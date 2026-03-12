import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import videoBackground from '../../assets/v1.mp4';

export default function Header() {
  const navigate = useNavigate();
  const { getCartItemCount } = useCart();

  // Top Info Bar
  const topBarStyle = {
    background: "#1a1a1a",
    color: "#fff",
    padding: "8px 24px",
    fontSize: "0.75rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }

  const socialIconsStyle = {
    display: "flex",
    gap: "12px"
  }

  const iconStyle = {
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "0.9rem"
  }

  const infoSectionStyle = {
    display: "flex",
    gap: "24px",
    alignItems: "center"
  }

  const infoDividerStyle = {
    color: "none",
    margin: "0 8px"
  }

  // Hero Section Styles
  const heroStyle = {
    position: "relative",
    height: "600px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 48px",
    overflow: "hidden"
  }

  const videoBackgroundStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0
  }

  const videoOverlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, rgba(80, 80, 100, 0.7) 0%, rgba(40, 40, 60, 0.7) 100%)",
    zIndex: 1
  }

  // RIGHT side hero text
  const heroTextContainerStyle = {
    maxWidth: "500px",
    textAlign: "right",
    color: "#fff",
    position: "relative",
    zIndex: 2
  }

  const heroTitleStyle = {
    fontSize: "3rem",
    fontWeight: 900,
    lineHeight: 1.2,
    marginBottom: "24px",
    color: "#fff"
  }

  const heroSubtitleStyle = {
    fontSize: "1.1rem",
    fontWeight: 500,
    marginBottom: "32px",
    color: "#e0e0e0",
    lineHeight: 1.6
  }
  const primaryBtn = {
        background: "#d4a574",
        color: "#fff",
        border: "none",
        borderRadius: 999,
        padding: "10px 20px",
        fontWeight: 700,
        cursor: "pointer"
    };

  const enquireButtonStyle = {
    background: "#d4a574",
    color: "#fff",
    border: "none",
    padding: "14px 40px",
    fontSize: "1rem",
    fontWeight: 700,
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.3s",
    textTransform: "uppercase",
    letterSpacing: "1px"
  }

  const cartButtonStyle = {
    position: "relative",
    background: "#d4a574",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    fontSize: "0.9rem",
    fontWeight: 600,
    borderRadius: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  }

  const cartBadgeStyle = {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    fontSize: "0.7rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }

  return (
    <>
      {/* Top Info Bar */}
      <div style={topBarStyle}>
        <div style={socialIconsStyle}>
          <a style={iconStyle} href="#">f</a>
          <a style={iconStyle} href="#">in</a>
          <a style={iconStyle} href="#">Instagram</a>
        </div>

        <div style={infoSectionStyle}>
          <span> +91-9443534549</span>
          <span style={infoDividerStyle}>|</span>
          <span> prematextilmills@gmail.com</span>
          <span style={infoDividerStyle}>|</span>
          <button style={cartButtonStyle} onClick={() => navigate('/cart')}>
            View Cart
            {getCartItemCount() > 0 && (
              <span style={cartBadgeStyle}>{getCartItemCount()}</span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={heroStyle}>
        {/* Video Background */}
        <video 
          style={videoBackgroundStyle}
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={videoBackground} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay */}
        <div style={videoOverlayStyle}></div>

        {/* LEFT SIDE LABEL */}
        <span
  style={{
    position: "absolute",
    left: "48px",
    top: "50%",
    transform: "translateY(-50%)",
    fontFamily: "'Cinzel', 'Cormorant SC', serif",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "2.8rem",
    letterSpacing: "1px",
    zIndex: 2,
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale"
  }}
>
  Prema Textile Mills
</span>


        {/* RIGHT SIDE TEXT */}
        <div style={heroTextContainerStyle}>
          <h1 style={heroTitleStyle}>
            Fabric that defines elegance.
          </h1>

          <p style={heroSubtitleStyle}>
            Great fabric is the foundation of great design
          </p>

          <button style={enquireButtonStyle} onClick={() => document.getElementById('buy')?.scrollIntoView({ behavior: 'smooth' })}>Buy Now</button>
        </div>
      </div>
    </>
  )
}
