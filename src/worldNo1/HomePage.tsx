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

export default function HomePage() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-white">
      <Navigation />

      <HeroSection />

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

      <Chatbot phoneDisplay="+977 9817858632" />
    </div>
  );
}
