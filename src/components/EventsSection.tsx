import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Images, PartyPopper, UsersRound, X } from "lucide-react";
import buildingImage from "../assets/hstl_001/main-building-hd.jpg";
import messImage from "../assets/hstl_001/mess-hd.jpg";
import parkingImage from "../assets/hstl_001/parking-hd.jpg";
import roomTwoImage from "../assets/hstl_001/room-2sharing-hd.jpg";
import roomThreeImage from "../assets/hstl_001/room-3sharing-hd.jpg";
import bathroomImage from "../assets/hstl_001/bathroom.jpeg";
import festivalHoliImage from "../assets/hstl_001/festival-holi-hd.jpg";
import festivalImage from "../assets/hstl_001/festival-2-hd.jpg";

type GalleryKey = "festival" | "student";
type ActiveGalleryKey = GalleryKey | "all";

type GalleryPhoto = {
  title: string;
  image: string;
  showTitle?: boolean;
};

const festivalGalleryFilenames = new Set([
  "student-life-09.jpeg",
  "student-life-12.jpeg",
]);

const galleryEntries = Object.entries(
  import.meta.glob("../assets/hstl_001/gallery/*.{jpg,jpeg,png}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
).sort(([a], [b]) => a.localeCompare(b));

const studentPhotos = galleryEntries
  .filter(([path]) => {
    const filename = path.split("/").pop();
    return filename ? !festivalGalleryFilenames.has(filename) : true;
  })
  .map(([, image], index) => ({
    title: `Student Life ${index + 1}`,
    image: image as string,
  }));

const festivalPhotos = [
  { title: "Holi Celebration", image: festivalHoliImage, showTitle: true },
  { title: "Festival Gathering", image: festivalImage, showTitle: true },
];

const propertyPhotos = [
  { title: "Main Building", image: buildingImage, showTitle: true },
  { title: "Mess Area", image: messImage, showTitle: true },
  { title: "Two Sharing Room", image: roomTwoImage, showTitle: true },
  { title: "Three Sharing Room", image: roomThreeImage, showTitle: true },
  { title: "Bathroom", image: bathroomImage, showTitle: true },
  { title: "Two-Wheeler Parking", image: parkingImage, showTitle: true },
];

const allPhotos = [
  ...festivalPhotos,
  ...studentPhotos,
  ...propertyPhotos,
];

const galleries = {
  festival: {
    title: "Festival Images",
    description:
      "Holi colors, festival meals, and Dashain-Tihar moments together.",
    cover: festivalPhotos[0]?.image ?? buildingImage,
    accent: "from-blue-500/70 via-sky-400/35 to-blue-950/90",
    icon: PartyPopper,
    photos: festivalPhotos,
  },
  student: {
    title: "Student Images",
    description: "Daily community, room life, and shared hostel routines.",
    cover: studentPhotos[2]?.image ?? buildingImage,
    accent: "from-blue-500/65 via-sky-400/30 to-blue-950/90",
    icon: UsersRound,
    photos: studentPhotos,
  },
} satisfies Record<
  GalleryKey,
  {
    title: string;
    description: string;
    cover: string;
    accent: string;
    icon: typeof PartyPopper;
    photos: GalleryPhoto[];
  }
>;

export default function EventsSection() {
  const [activeGallery, setActiveGallery] = useState<ActiveGalleryKey | null>(
    null,
  );
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const activePhotos =
    activeGallery === "all"
      ? allPhotos
      : activeGallery
        ? galleries[activeGallery].photos
        : null;
  const galleryGridClass =
    activeGallery === "festival" ? "lg:grid-cols-3" : "lg:grid-cols-4";

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto]);

  return (
    <section
      id="events"
      className="scroll-mt-16 bg-gradient-to-b from-white via-blue-50/30 to-white pb-14 pt-8 sm:pb-16 sm:pt-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-7 max-w-3xl text-center"
        >
          <p className="text-sm font-bold uppercase text-blue-700">
            Community
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-blue-950 md:text-4xl">
            Festival and student life in photos
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
            Subidha Girls Hostel keeps students supported during ordinary weeks
            and major Nepali festivals.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {(["festival", "student"] as const).map((key, index) => {
            const gallery = galleries[key];
            const Icon = gallery.icon;
            const isActive = activeGallery === key;

            return (
              <motion.button
                key={gallery.title}
                type="button"
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                onClick={() =>
                  setActiveGallery((current) => (current === key ? null : key))
                }
                aria-pressed={isActive}
                className={`group relative h-64 overflow-hidden rounded-lg bg-blue-950 text-left shadow-lg outline-none transition-shadow duration-500 sm:h-72 focus-visible:ring-4 focus-visible:ring-blue-300 ${
                  isActive
                    ? "ring-4 ring-blue-500/25 shadow-2xl"
                    : "hover:shadow-2xl"
                }`}
              >
                <img
                  src={gallery.cover}
                  alt={gallery.title}
                  className="h-full w-full object-cover object-center opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${gallery.accent}`}
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-sky-100 backdrop-blur">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition duration-300 ${isActive ? "translate-x-1 bg-white/25" : ""}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {gallery.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-100 sm:text-base">
                    {gallery.description}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
                    <Images className="h-4 w-4" />
                    {gallery.photos.length}{" "}
                    {gallery.photos.length === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-6 flex justify-center"
        >
          <button
            type="button"
            onClick={() =>
              setActiveGallery((current) => (current === "all" ? null : "all"))
            }
            aria-pressed={activeGallery === "all"}
            className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
              activeGallery === "all"
                ? "bg-blue-700 text-white shadow-lg"
                : "bg-blue-950 text-white shadow-sm hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-lg"
            }`}
          >
            Gallery
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activePhotos && (
            <motion.div
              key={activeGallery}
              initial={{ opacity: 0, y: 28, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 overflow-hidden"
            >
              <div className={`grid gap-4 sm:grid-cols-2 ${galleryGridClass}`}>
                {activePhotos.map((photo, index) => (
                  <motion.button
                    key={`${activeGallery}-${photo.title}`}
                    type="button"
                    initial={{ opacity: 0, y: 22, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.42, delay: index * 0.07 }}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative h-56 overflow-hidden rounded-lg bg-blue-950 text-left shadow-md outline-none transition-shadow duration-300 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-blue-300 sm:h-60"
                  >
                    <motion.img
                      layoutId={`gallery-photo-${photo.image}`}
                      src={photo.image}
                      alt={photo.title}
                      className="h-full w-full object-cover object-center opacity-95 transition duration-700 group-hover:scale-105"
                    />
                    {photo.showTitle && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-blue-950/20 to-transparent" />
                        <figcaption className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-base font-bold leading-tight text-white sm:text-lg">
                            {photo.title}
                          </p>
                        </figcaption>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-950/90 p-4 backdrop-blur-md sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedPhoto(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selectedPhoto.title}
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
                layoutId={`gallery-photo-${selectedPhoto.image}`}
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="max-h-[92vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/95 text-blue-950 shadow-lg transition duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                aria-label="Close full photo"
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
