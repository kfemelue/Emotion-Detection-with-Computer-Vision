import { useState } from 'react';
import  UploadPhoto  from './components/UploadPhoto';
import Header from './components/header';
import emotionDetectorLogo from './assets/emotion-detector-logo.svg'
import './App.css'

function App() {
  return (
    <div>
      <Header />
      <UploadPhoto />
    </div>
  )
}

export default App
