import React from "react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Buy from "./Buy.jsx";
import Offers from "./Offers.jsx";
import Steps from "./Step.jsx";
import Location from "./Location.jsx";
import Mem from "./Mem.jsx";
import "./Home.css";
export default function Home() {
    return (
        <>
            {/* Full-page background video - put file at public/videos/home-bg.mp4 */}
                      

            <div className="home-content">
              <Navbar  />
              <Buy />
              <Offers />
                            <Steps />

                            {/* Inline section video after Steps - place file at public/videos/section-video.mp4 */}
                            <section className="inline-video-section">
                                <video
                                    className="inline-video"
                                    src="src/assets/v1.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    aria-hidden="true"
                                />
                                <div className="inline-video-overlay" aria-hidden="true" />
                            </section>

                            <Location />
              <Mem />
              <Footer />
            </div>
        </>
    );
}
