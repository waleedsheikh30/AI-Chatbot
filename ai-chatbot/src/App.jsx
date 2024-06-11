import React from 'react'
import './App.css'
import Chatbot from './components/chatbot'
import Navbar from './components/navbar'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <Chatbot/>
    </div>
  )
}

export default App