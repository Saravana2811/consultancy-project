import React from "react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Buy from "./Buy.jsx";
import Steps from "./Step.jsx";
import Mem from "./Mem.jsx";
export default function Home() {
    return (
        <>
            <Navbar  />
            <Buy />
            <Steps />
            <Mem />
            <Footer />
        </>
    );
}
