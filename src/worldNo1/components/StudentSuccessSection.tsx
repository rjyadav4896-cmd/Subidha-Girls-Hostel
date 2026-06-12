import { useCallback, useEffect, useRef, useState } from "react";
import junaImage from "../../assets/hstl_001/juna-ha.png";
import dilKumariImage from "../../assets/hstl_001/dil-kumari-sunuwar-anm.png";
import melinaImage from "../../assets/hstl_001/melina.png";
import nishaImage from "../../assets/hstl_001/nisha-kumari-mandal-bsc-nursing.png";
import pujaImage from "../../assets/hstl_001/puja-yadav-ha.png";
import successMedicalImage from "../../assets/hstl_001/success-medical-thumb.png";
import successLoksewaImage from "../../assets/hstl_001/success-loksewa-thumb.png";
import successEngineeringImage from "../../assets/hstl_001/success-engineering-thumb.png";

const testimonials = [
  {
    photo: melinaImage,
    photoPosition: "50% 38%",
    name: "Melina Yesmali Magar",
    college: "NMI",
    rank: "Loksewa success",
    exam: "Student achievement",
    quote:
      "One of the best hostel in janakpur, where I felt like living in my own home",
  },
  {
    photo: junaImage,
    photoPosition: "50% 42%",
    name: "Juna Basyal",
    college: "HA",
    rank: "Student success",
    exam: "Health assistant",
    quote:
      "Hostel Warden cared us as mother, and always helped in my preparation journey",
  },
  {
    photo: pujaImage,
    photoPosition: "50% 34%",
    name: "Puja Yadav",
    college: "HA",
    rank: "Cracked HA exam",
    exam: "Health assistant",
    quote: "The environment and the food is perfect for the preparation",
  },
  {
    photo: nishaImage,
    photoPosition: "50% 34%",
    name: "Nisha Kumari Mandal",
    college: "BSC Nursing",
    rank: "Loksewa",
    exam: "Nursing",
    quote:
      "The supportive hostel routine gave me a comfortable place to continue my studies.",
  },
  {
    photo: dilKumariImage,
    photoPosition: "50% 42%",
    name: "Dil Kumari Sunuwar",
    college: "ANM",
    rank: "Loksewa",
    exam: "Auxiliary Nurse Midwife",
    quote: "I like the hostel environment most",
  },
];

const successCategories = [
  {
    label: "Medical",
    count: "10 Selections",
    image: successMedicalImage,
    imagePosition: "50% 45%",
  },
  {
    label: "Loksewa",
    count: "40 Selections",
    image: successLoksewaImage,
    imagePosition: "50% 43%",
  },
  {
    label: "Engineering",
    count: "5 Selections",
    image: successEngineeringImage,
    imagePosition: "50% 45%",
  },
];

export default function StudentSuccessSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const transitionTimer = useRef<number | null>(null);
  const activeTestimonial = testimonials[activeIndex];

  const showTestimonial = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex) return;

      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }

      setIsVisible(false);
      transitionTimer.current = window.setTimeout(() => {
        setActiveIndex(nextIndex);
        window.requestAnimationFrame(() => setIsVisible(true));
      }, 180);
    },
    [activeIndex],
  );

  const showNextTestimonial = useCallback(() => {
    showTestimonial((activeIndex + 1) % testimonials.length);
  }, [activeIndex, showTestimonial]);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      showTestimonial((activeIndex + 1) % testimonials.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [activeIndex, isPaused, showTestimonial]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  return (
    <section id="success" className="scroll-mt-16 bg-blue-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-wide text-blue-700">
          Topper Stories
        </h2>

        <div className="mx-auto grid max-w-[640px] grid-cols-3 gap-5 text-center sm:gap-12">
          {successCategories.map((category) => {
            return (
              <div key={category.label} className="flex min-w-0 flex-col items-center">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md ring-2 ring-slate-200 sm:h-24 sm:w-24">
                  <img
                    src={category.image}
                    alt={`${category.label} success`}
                    style={{ objectPosition: category.imagePosition }}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3 text-sm font-black uppercase leading-5 text-slate-950 sm:text-base">
                  {category.label}
                </div>
                <div className="text-xs font-bold leading-5 text-slate-600 sm:text-sm">
                  ({category.count})
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="relative mx-auto mt-8 min-h-[188px] max-w-[888px] cursor-pointer rounded-2xl bg-white px-6 py-8 shadow-xl ring-1 ring-slate-200 sm:h-[188px] sm:py-6"
          onClick={showNextTestimonial}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`flex flex-col gap-4 pr-2 transition-all duration-300 ease-out sm:flex-row sm:items-start sm:gap-5 sm:pr-16 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            <div className="h-16 w-16 flex-none overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
              <img
                src={activeTestimonial.photo}
                alt={`${activeTestimonial.name} testimonial`}
                style={{ objectPosition: activeTestimonial.photoPosition }}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <blockquote className="max-w-[690px] text-base font-medium italic leading-7 text-slate-700">
                "{activeTestimonial.quote}"
              </blockquote>

              <div className="mt-5 text-base font-bold leading-6 text-blue-950">
                {activeTestimonial.name}
              </div>

              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-semibold leading-5 text-slate-600">
                <span>{activeTestimonial.college}</span>
                <span aria-hidden="true">{"\u00B7"}</span>
                <span className="text-blue-700">{activeTestimonial.rank}</span>
                <span aria-hidden="true">{"\u00B7"}</span>
                <span>{activeTestimonial.exam}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={testimonial.name}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showTestimonial(index);
                  }}
                  aria-label={`Show ${testimonial.name}'s testimonial`}
                  aria-current={isActive}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    isActive ? "bg-blue-700" : "bg-slate-300"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
