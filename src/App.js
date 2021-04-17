import React from 'react';
import NavBar from './components/NavBar'
import WorkArea from './components/WorkArea'
import './App.scss';
import { ThemeProvider } from './components/ThemeProvider'




function App() {
  return (
    <ThemeProvider>
    <>
     <NavBar/> 
     <WorkArea/>
    </>
    </ThemeProvider>
  );
}

export default App;
