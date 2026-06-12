import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import HomePage from './worldNo1/HomePage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
);
