import React from "react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Buy from "./Buy.jsx";
import SampleRequest from "./SampleRequest.jsx";
import Steps from "./Step.jsx";
import Location from "./Location.jsx";
import Mem from "./Mem.jsx";
import TamilChat from "../pages/TamilChat.jsx";
import "./Home.css";
import video1 from "../../assets/v2i.mp4";

export default function Home() {
    return (
        <>
            {/* Full-page background video - put file at public/videos/home-bg.mp4 */}
                      

            <div className="home-content">
              <Navbar  />
              <Buy />
              <SampleRequest />
                            <Steps />

                            {/* Video Banner */}
                            <section className="video-banner">
                                <div className="video-banner-glow" />
                                <video
                                    className="banner-video"
                                    src={video1}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                                <div className="video-banner-overlay">
                                    <p className="video-kicker">Prema Textiles</p>
                                    <h2>Crafted Fabrics, Delivered Fast</h2>
                                    <span>Premium quality weaves for modern creators</span>
                                </div>
                            </section>

                            <Location />
              <Mem />
              <Footer />

                            <TamilChat
                                userId={localStorage.getItem('userId') || 'guest'}
                                userName={localStorage.getItem('userName') || 'User'}
                            />
            </div>
        </>
    );
}
