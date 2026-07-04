import { useState } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import RoomsSection from './components/RoomsSection';
import FacilitiesSection from './components/FacilitiesSection';
import FoodSection from './components/FoodSection';
import EventsSection from './components/EventsSection';
import StudentSuccessSection from './components/StudentSuccessSection';
import GuidelinesSection from './components/GuidelinesSection';
import StatisticsSection from './components/StatisticsSection';
// import GallerySection from './components/GallerySection';
import NearbySection from './components/NearbySection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import LoginDialog from './components/LoginDialog';
import { ReadyToLiveModal } from './hms/components/ReadyToLiveModal';

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [readyToLiveOpen, setReadyToLiveOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-white">
      <Navigation
        onLoginClick={() => setIsLoginOpen(true)}
        onReadyToLiveClick={() => setReadyToLiveOpen(true)}
      />

      <HeroSection onReadyToLive={() => setReadyToLiveOpen(true)} />

      <RoomsSection />
      <FacilitiesSection />
      <FoodSection />
      <EventsSection />
      <StudentSuccessSection />
      <GuidelinesSection />
      <StatisticsSection />
      {/* <GallerySection /> */}
      <NearbySection />
      <ContactSection />
      <Footer />

      <Chatbot phoneDisplay="+977 9706666497" />
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ReadyToLiveModal open={readyToLiveOpen} onClose={() => setReadyToLiveOpen(false)} />
    </div>
  );
}
