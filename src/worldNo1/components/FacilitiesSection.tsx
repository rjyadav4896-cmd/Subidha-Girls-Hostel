import { motion } from "motion/react";
import {
  Bike,
  GlassWater,
  BrushCleaning,
  Shirt,
  Sparkles,
  Sun,
  Users,
  Armchair,
  Columns3,
} from "lucide-react";
import parkingImage from "../../assets/hstl_001/parking-hd.jpg";

export default function FacilitiesSection() {
  const available = [
    {
      icon: GlassWater,
      name: "Drinking water",
      description: "Hot and cold drinking water available.",
    },
    {
      icon: Shirt,
      name: "Laundry",
      description: "No laundry service; students manage laundry themselves.",
    },
    {
      icon: Armchair,
      name: "Study space",
      description: "Students can study in their rooms and shared areas.",
    },
    {
      icon: Columns3,
      name: "Essentials",
      description: "Students should bring bedsheet, pillow, cover, and blanket.",
    },
    {
      icon: Bike,
      name: "Parking",
      description: "Bike and scooter parking available.",
    },
    {
      icon: Sun,
      name: "Terrace access",
      description: "Open space to study or spend time.",
    },
    {
      icon: Sparkles,
      name: "Bathroom cleaning",
      description: "Bathrooms are cleaned twice a week.",
    },
    {
      icon: Users,
      name: "Parent visits",
      description: "Students can meet parents inside the hostel.",
    },
    {
      icon: BrushCleaning,
      name: "Room responsibility",
      description: "Room cleaning is handled by students.",
    },
  ];

  return (
    <section
      id="facilities"
      className="scroll-mt-16 bg-gradient-to-b from-white via-blue-50 to-white py-14 sm:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.35fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Facilities
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-blue-950 md:text-4xl">
              Services that matter every week
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              From daily essentials and clean shared spaces to parking, terrace
              access, drinking water, and parent visits, every facility is
              thoughtfully arranged around students' routines and comfort.
            </p>
            <div className="group relative mt-5 overflow-hidden rounded-lg bg-blue-950 shadow-xl">
              <img
                src={parkingImage}
                alt="Two-wheeler parking at Subidha Girls Hostel"
                className="h-64 w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 sm:h-72 lg:h-[340px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold text-white backdrop-blur">
                  <Bike className="h-4 w-4 text-sky-200" />
                  Two-wheeler parking
                </span>
                <p className="mt-3 max-w-sm text-lg font-bold leading-tight text-white">
                  Practical facilities inside the hostel area.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {available.map((facility, index) => {
              const Icon = facility.icon;
              return (
                <motion.div
                  key={facility.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group flex min-h-[116px] items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-tight text-blue-950">
                      {facility.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      {facility.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
