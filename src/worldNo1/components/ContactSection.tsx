import { motion } from 'motion/react';
import { Facebook, Mail, MapPin, Music2, Phone, UserRound } from 'lucide-react';

export default function ContactSection() {
  const contactInfo = [
    { icon: UserRound, title: 'Owner', content: 'Rajesh Kumar Singh', action: null },
    { icon: Phone, title: 'WhatsApp / Phone', content: '+977 9817858632', action: 'tel:+9779817858632' },
    { icon: Mail, title: 'Email', content: 'pabitrathapa547@gmail.com', action: 'mailto:pabitrathapa547@gmail.com' },
    { icon: MapPin, title: 'Address', content: 'Bajrang Chowk, Janakpur, Madhesh, Nepal', action: 'https://maps.app.goo.gl/2S3xdda5T81uxUUNA' }
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Contact</p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold text-blue-950">Talk to Subidha Girls Hostel</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Reach out directly for room details, fee confirmation, and visit timing.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-2xl bg-blue-950 p-8 text-white">
            <h3 className="text-3xl font-bold">Subidha Girls Hostel</h3>
            <p className="mt-3 text-slate-300">Subidha Girls Hostel · Bajrang Chowk, Janakpur</p>

            <div className="mt-8 space-y-5">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                const content = (
                  <>
                    <div className="text-sm text-slate-400">{info.title}</div>
                    <div className="font-bold text-white">{info.content}</div>
                  </>
                );
                return (
                  <div key={info.title} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <Icon className="h-6 w-6 text-sky-300" />
                    </div>
                    {info.action ? (
                      <a href={info.action} target={info.action.startsWith('http') ? '_blank' : undefined} rel={info.action.startsWith('http') ? 'noreferrer' : undefined} className="hover:text-sky-200">
                        {content}
                      </a>
                    ) : (
                      <div>{content}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://www.facebook.com/share/18FWDLa4o2/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-blue-950 hover:bg-sky-100">
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@subidhagirlshostel01?_r=1&_t=ZS-96qCyn4chQP"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 font-bold text-white hover:bg-white/10"
              >
                <Music2 className="h-4 w-4" />
                TikTok
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
            <iframe
              title="Subidha Girls Hostel Location"
              src="https://www.google.com/maps?q=Bajrang%20Chowk%20Janakpur%20Madhesh%20Nepal&output=embed"
              width="100%"
              height="100%"
              className="min-h-[520px]"
              style={{ border: 0 }}
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
