// import { motion } from 'motion/react';
// import building from '../../assets/hstl_001/main-building.jpg';
// import room2 from '../../assets/hstl_001/room-2sharing.jpg';
// import room3 from '../../assets/hstl_001/room-3sharing.png';
// import parking from '../../assets/hstl_001/parking.jpg';
// import festival from '../../assets/hstl_001/festival-holi.jpg';
// import studentLife from '../../assets/hstl_001/student-life-2.jpg';

// export default function GallerySection() {
//   const galleryImages = [
//     { src: building, alt: 'Main building', category: 'Building', className: 'lg:col-span-2' },
//     { src: room2, alt: 'Two sharing room', category: 'Rooms', className: '' },
//     { src: room3, alt: 'Three sharing room', category: 'Rooms', className: '' },
//     { src: parking, alt: 'Two-wheeler parking', category: 'Parking', className: '' },
//     { src: festival, alt: 'Festival celebration', category: 'Festivals', className: 'lg:col-span-2' },
//     { src: studentLife, alt: 'Student life', category: 'Community', className: '' }
//   ];

//   return (
//     <section className="py-20 bg-blue-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-14"
//         >
//           <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Photo Gallery</p>
//           <h2 className="mt-2 text-3xl md:text-5xl font-bold text-blue-950">A closer look at Subidha Girls Hostel</h2>
//         </motion.div>

//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           {galleryImages.map((image, index) => (
//             <motion.div
//               key={`${image.category}-${image.alt}`}
//               initial={{ opacity: 0, scale: 0.96 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.4, delay: index * 0.04 }}
//               className={`group relative h-72 rounded-2xl overflow-hidden shadow-lg ${image.className}`}
//             >
//               <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//               <div className="absolute inset-0 bg-gradient-to-t from-blue-950/75 via-transparent to-transparent" />
//               <div className="absolute bottom-4 left-4 right-4">
//                 <span className="inline-block px-3 py-1 bg-white/90 text-blue-950 text-xs font-bold rounded-full mb-2">{image.category}</span>
//                 <h4 className="text-white font-bold">{image.alt}</h4>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
