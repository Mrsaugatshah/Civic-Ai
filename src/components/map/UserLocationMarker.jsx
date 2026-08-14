import { motion } from "framer-motion";

export function UserLocationMarker({ screen, accuracyPx }) {
  return (
    <div
      className="pointer-events-none absolute z-0"
      style={{ left: screen.sx, top: screen.sy, transform: "translate(-50%, -50%)" }}
    >
      {accuracyPx > 0 && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10"
          style={{ width: accuracyPx, height: accuracyPx }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow" />
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-primary"
        animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="sr-only">Your location</span>
    </div>
  );
}
