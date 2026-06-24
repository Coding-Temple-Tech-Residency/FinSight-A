import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../frontend/src/pages/LoginPage';


function App() {
  return (
    <div>
      <h1>FinSight</h1>
    
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<LoginPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
