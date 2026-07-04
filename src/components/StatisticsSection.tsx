import { motion } from "motion/react";
import { CalendarDays, MoonIcon, Sunrise, Wallet } from "lucide-react";

export default function StatisticsSection() {
  const details = [
    {
      icon: Wallet,
      label: "Admission Fee",
      value: "रु 1,000",
      description: "One-time admission charge",
    },
    {
      icon: MoonIcon,
      label: "Night In Time",
      value: "9:00 PM",
      description: "Daily hostel entry deadline",
    },
    {
      icon: Sunrise,
      label: "Morning Out Time",
      value: "5:00 AM",
      description: "Students can head out from here",
    },
    {
      icon: CalendarDays,
      label: "Dashain & Tihar",
      value: "Remains open",
      description: "Hostel stays available during festivals",
    },
  ];

  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Quick Facts
          </p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold text-blue-950">
            Important hostel details at a glance
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Clear fees, daily timings, and festival availability for students
            and parents.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail, index) => {
            const Icon = detail.icon;
            return (
              <motion.div
                key={detail.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-blue-700 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  {detail.label}
                </div>
                <div className="mt-2 text-3xl font-black text-blue-950">
                  {detail.value}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {detail.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
