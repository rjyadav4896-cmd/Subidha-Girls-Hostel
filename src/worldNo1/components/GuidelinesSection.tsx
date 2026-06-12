import { motion } from "motion/react";
import { CheckCircle2, PlugZap, Shirt, UserRoundCheck } from "lucide-react";

export default function GuidelinesSection() {
  const guidelines = [
    {
      icon: CheckCircle2,
      title: "Bring essentials",
      text: "New students should bring bedsheet, pillow, pillow cover, and blanket.",
    },
    {
      icon: PlugZap,
      title: "Electric items",
      text: "Electric kettle and iron are not allowed.",
    },
    {
      icon: UserRoundCheck,
      title: "Visitors",
      text: "Students can meet people inside the hostel when visitors are parents.",
    },
    {
      icon: Shirt,
      title: "Room care",
      text: "Room cleaning is handled by students; bathroom cleaning is provided twice a week.",
    },
  ];

  return (
    <section id="guidelines" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Student Guidelines
          </p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold text-blue-950">
            Know before you move in
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            A few simple expectations help students and parents come prepared,
            feel comfortable, and step into their second home with confidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {guidelines.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-2xl bg-blue-50 p-6 ring-1 ring-slate-200"
              >
                <Icon className="w-8 h-8 text-blue-700 mb-4" />
                <h3 className="text-xl font-bold text-blue-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-slate-600">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
