import React from "react";

const styles = {
  footer: {
    backgroundColor: "#111827",
    color: "white",
    padding: "3rem 1rem",
    width: "98%",
  },

  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
    paddingBottom: "2rem",
    borderBottom: "1px solid #374151",
  },

  section: {
    padding: "0 1rem",
  },

  h3: {
    fontSize: "1.25rem",
    fontWeight: "700",
    marginBottom: "1rem",
    color: "#f97316",
  },

  h4: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#f97316",
  },

  p: {
    marginBottom: "1rem",
    color: "#d1d5db",
    lineHeight: 1.5,
  },

  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: ".5rem",
    color: "#d1d5db",
    marginTop: "1rem",
  },

  ul: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  li: {
    marginBottom: ".75rem",
    color: "#9ca3af",
    transition: "color 0.3s ease",
    cursor: "pointer",
  },

  emergency: {
    color: "#f97316",
    fontWeight: 600,
  },

  bottom: {
    maxWidth: "1200px",
    margin: "2rem auto 0",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: ".875rem",
  },

  design: {
    fontSize: ".8rem",
    color: "#6b7280",
    marginTop: "1rem",
  },
};

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        {/* Section 1 */}
        <div style={styles.section}>
          <h3 style={styles.h3}>Prema Textile Mills</h3>
          <p style={styles.p}>Location</p>
          <div style={styles.contactInfo}>
            <span></span>
          </div>
        </div>

        {/* Section 2 */}
        <div style={styles.section}>
          <h4 style={styles.h4}>Features</h4>
          <ul style={styles.ul}>
            <li style={styles.li}>Buy Fabric</li>
            <li style={styles.li}>Fabric Dyeing Services</li>
            <li style={styles.li}>Color Catalog</li>
            <li style={styles.li}>Fabric Store</li>
            
          </ul>
        </div>

        {/* Section 3 */}
        <div style={styles.section}>
          <h4 style={styles.h4}>Available On</h4>
          <ul style={styles.ul}>
            <li style={styles.li}>Desktop</li>
            <li style={styles.li}>Windows</li>
            <li style={styles.li}>Ios</li>
            <li style={styles.li}>WebPages</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div style={styles.section}>
          <h4 style={styles.h4}>Support</h4>
          <ul style={styles.ul}>
            <li style={styles.li}>Contact Us</li>
            <li style={styles.li}>Help Center</li>
            <li style={{ ...styles.li, ...styles.emergency }}>
              24/7 Emergency Service
            </li>
          </ul>
        </div>
      </div>

      <div style={styles.bottom}>
        <p>© 2025 ABC Company. All rights reserved. Licensed & Insured.</p>
        <p style={styles.design}>Designed and Maintained By Saravana M || Prabhu Chennimalai KD||Poornima RK</p>
      </div>
    </footer>
  );
};

export default Footer;
