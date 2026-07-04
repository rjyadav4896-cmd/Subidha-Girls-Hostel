import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Cross,
  MapPinned,
  School,
  University,
  X,
} from "lucide-react";
import building from "../assets/hstl_001/main-building-hd.jpg";

const places = [
  { icon: MapPinned, name: "Highway", time: "1 min walk" },
  { icon: BookOpen, name: "OM Coaching Centre", time: "5 min walk" },
  { icon: University, name: "ANTI College", time: "8 min" },
  { icon: School, name: "Stationery", time: "1 min walk" },
  { icon: Cross, name: "Hospital", time: "1 min walk" },
];

export default function NearbySection() {
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);

  useEffect(() => {
    if (!isBuildingOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsBuildingOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBuildingOpen]);

  return (
    <section
      id="nearby"
      className="py-20 bg-gradient-to-b from-blue-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl shadow-xl"
          >
            <button
              type="button"
              onClick={() => setIsBuildingOpen(true)}
              className="group block h-[520px] w-full bg-blue-950 text-left outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              aria-label="Open full Subidha Girls Hostel building photo"
            >
              <motion.img
                layoutId="nearby-main-building"
                src={building}
                alt="Subidha Girls Hostel building near student essentials"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Nearby Places
            </p>
            <h2 className="mt-2 text-3xl md:text-5xl font-bold text-blue-950">
              Everything students need is close
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              The Bajrang Chowk location keeps everyday student needs close,
              including highway access, coaching, stationery, hospital support,
              and Janaki Mandir within 2.9 km.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {places.map((place, index) => {
                const Icon = place.icon;
                return (
                  <motion.div
                    key={place.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                  >
                    <Icon className="h-7 w-7 text-blue-700 mb-3" />
                    <div className="font-bold text-blue-950">{place.name}</div>
                    <div className="text-sm text-slate-600">{place.time}</div>
                  </motion.div>
                );
              })}
            </div>

            <a
              href="https://maps.app.goo.gl/2S3xdda5T81uxUUNA"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-lg bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-900 transition-colors"
            >
              View on Google Maps
            </a>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isBuildingOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-950/90 p-4 backdrop-blur-md sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsBuildingOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Subidha Girls Hostel full building photo"
          >
            <motion.div
              className="relative flex max-h-[92vh] w-full max-w-6xl items-center justify-center"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <motion.img
                layoutId="nearby-main-building"
                src={building}
                alt="Subidha Girls Hostel full building"
                className="max-h-[92vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setIsBuildingOpen(false)}
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/95 text-blue-950 shadow-lg transition duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                aria-label="Close full building photo"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
