// import { useState, useEffect, useRef } from "react";

// export default function Dragger() {

//   const [pos, setPos] = useState({x:100})

//   const posRef = useRef(pos)

//   useEffect(() => {
//     posRef.current = pos
//   }, [pos])

//   const dragging = useRef(false)
//   const start = useRef({x:0})
//   const last = useRef({x:0})
//   const reqAnFr = useRef(null)

//   const handleTouchStart = (e) => {
//     if(!e.touches || e.touches.length === 0) return
//     const t = e.touches[0]
//     dragging.current = true
//     start.current = {
//       x: t.clientX - posRef.current.x
//     }
//   }

//   const handleMove = (e) => {
//     if(!dragging.current || !e.touches || e.touches.length === 0) return
//     const t = e.touches[0]
//     last.current = {x: t.clientX - start.current.x}

//     if(!reqAnFr.current){
//       reqAnFr.current = requestAnimationFrame(() => {
//         setPos(last.current)
//         reqAnFr.current = null
//       })
//     }
//   }

//     const handleTouchEnd = (e) => {
//     dragging.current = false; // Tandai drag selesai
//     // Batalkan requestAnimationFrame jika masih ada yang tertunda
//     if (raf.current) {
//       cancelAnimationFrame(raf.current);
//       raf.current = null;
//     }
//   };

//   return(
//     <div style={{zIndex: 0, position: 'relative'}}
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleMove}
//       onTouchEnd={handleTouchEnd}
//       onTouchCancel={handleTouchEnd}
//     >
//       <div
//         style={{
//           background: 'blue',
//           width: '5rem',
//           height: '5rem',
//           transform: `translateX(${pos.x}px)`,
//           touchAction: "none",         // Nonaktifkan default gesture browser
//           userSelect: "none",          // Nonaktifkan seleksi teks
//           WebkitUserSelect: "none",    // Nonaktifkan seleksi teks di Safari
//         }}>
//       </div>
//     </div>
//   )
// }
