import { motion } from 'motion/react';
import { MapPin, Phone, Bus, Wallet } from 'lucide-react';
import heroImage from '../../assets/hstl_001/main-building-hd.jpg';

export default function HeroSection() {
  const highlights = [
    { icon: MapPin, label: 'Location', value: 'Bajrang Chowk, Janakpur' },
    { icon: Phone, label: 'WhatsApp', value: '+977 9817858632' },
    { icon: Wallet, label: 'Room starts from', value: 'रु 8,000' },
    { icon: Bus, label: 'Nearby', value: '1 min from Highway' }
  ];

  return (
    <section id="home" className="relative min-h-[82vh] overflow-hidden bg-blue-950 pt-16 sm:min-h-[88vh]">
      <img src={heroImage} alt="Subidha Girls Hostel main building" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.95),rgba(15,23,42,0.72),rgba(15,23,42,0.25))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 md:py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-2"
            >
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-sky-100 backdrop-blur sm:px-4 sm:text-sm">
                Subidha Girls Hostel - Student hostel in Janakpur
              </span>
              <span className="inline-flex items-center rounded-full border border-sky-300/40 bg-sky-300/15 px-3 py-2 text-xs font-bold text-sky-100 backdrop-blur sm:px-4 sm:text-sm">
                Janakpur oldest hostel
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-4xl font-bold leading-tight text-white sm:mt-6 sm:text-5xl md:text-7xl"
            >
              Subidha Girls Hostel
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:mt-6 sm:text-lg md:text-xl"
            >
              A comfortable and student-friendly girls hostel in Bajrang Chowk, Janakpur designed for focused living and everyday convenience. Best hostel in Janakpur.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap"
            >
              <a href="tel:+9779817858632" className="rounded-lg bg-sky-400 px-6 py-3 text-center font-bold text-blue-950 transition-colors hover:bg-sky-300">
                Call Hostel
              </a>
              <a
                href="https://maps.app.goo.gl/2S3xdda5T81uxUUNA"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-center font-bold text-white transition-colors hover:bg-white/20"
              >
                Open Map
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 md:grid-cols-4"
            >
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:p-4">
                    <Icon className="w-6 h-6 text-sky-300 mb-3" />
                    <div className="text-xs uppercase tracking-wide text-slate-300">{item.label}</div>
                    <div className="mt-1 text-sm font-bold text-white">{item.value}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="hidden lg:grid grid-cols-5 grid-rows-5 gap-4 h-[520px]"
          >
          </motion.div>
        </div>
      </div>
    </section>
  );
}
