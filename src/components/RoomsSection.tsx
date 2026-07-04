import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import room2 from "../assets/hstl_001/room-2sharing-hd.jpg";
import room3 from "../assets/hstl_001/room-3sharing-hd.jpg";

export default function RoomsSection() {
  const [selectedRoom, setSelectedRoom] = useState<{
    type: string;
    image: string;
  } | null>(null);

  const rooms = [
    {
      type: "2 Sharing",
      image: room2,
      price: "रु 8,500",
    },
    {
      type: "3 Sharing",
      image: room3,
      price: "रु 8,000",
    },
  ];

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedRoom(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRoom]);

  return (
    <section id="rooms" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <h2 className="mt-2 text-3xl md:text-5xl font-bold text-blue-950">
              Room Options
            </h2>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {rooms.map((room, index) => (
            <motion.div
              key={room.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/70"
            >
              <button
                type="button"
                onClick={() => setSelectedRoom(room)}
                className="group block h-56 w-full overflow-hidden text-left outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                aria-label={`Open full ${room.type} room photo`}
              >
                <motion.img
                  layoutId={`room-photo-${room.type}`}
                  src={room.image}
                  alt={`${room.type} room at Subidha Girls Hostel`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-950">
                      {room.type}
                    </h3>
                  </div>
                  <div className="rounded-xl bg-sky-100 px-3 py-2 text-right">
                    <div className="text-lg font-black text-blue-950">
                      {room.price}
                    </div>
                    <div className="text-xs text-slate-600">per month</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-950/90 p-4 backdrop-blur-md sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedRoom(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedRoom.type} room photo`}
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
                layoutId={`room-photo-${selectedRoom.type}`}
                src={selectedRoom.image}
                alt={`${selectedRoom.type} room at Subidha Girls Hostel`}
                className="max-h-[92vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/95 text-blue-950 shadow-lg transition duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                aria-label="Close full room photo"
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
