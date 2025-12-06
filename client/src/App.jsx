import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/before/Header'
import About from './components/before/About'
import Wedo from './components/before/Wedo'
import Footer from './components/before/Footer'
import './App.css'
import Signin from './components/pages/Signin'
import Login from './components/pages/Login'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Wedo />
              <About />
              <Footer />
            </>
          }
        />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
