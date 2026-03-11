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
import video1 from "../../assets/v1.mp4";
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
                                <video
                                    className="banner-video"
                                    src={video1}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </section>

                            <Location />
              <Mem />
              <Footer />
              
              {/* Tamil Chat Component - Only for Users */}
              <TamilChat 
                userId={localStorage.getItem('userId') || 'guest'} 
                userName={localStorage.getItem('userName') || 'User'} 
              />
            </div>
        </>
    );
}
