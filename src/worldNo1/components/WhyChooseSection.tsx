import { motion } from 'motion/react';
import { BatteryCharging, Bike, Home, Shirt, Sparkles, Utensils, GlassWater } from 'lucide-react';

export default function WhyChooseSection() {
  const features = [
    { icon: Home, title: 'Location', description: 'Bajrang Chowk, Janakpur, close to highway, coaching, stationery, hospital, and daily student needs.' },
    { icon: Utensils, title: 'Meal', description: 'Four meals: breakfast, lunch, snacks, and dinner are scheduled through the day.' },
    { icon: Shirt, title: 'Laundry', description: 'Students manage laundry themselves; no laundry service is provided.' },
    { icon: Sparkles, title: 'Bathroom Cleaning', description: 'Bathroom cleaning service is provided twice a week.' },
    { icon: GlassWater, title: 'Drinking water', description: 'Hot and cold drinking water are available.' },
    { icon: Bike, title: 'Parking', description: 'Two-wheeler parking is available inside the hostel area.' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Why Subidha Girls Hostel</p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold text-blue-950">Built for student life</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            With transparent fees, essential services, a convenient location, and simple, practical living.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="rounded-2xl bg-blue-50 p-6 ring-1 ring-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-950 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
