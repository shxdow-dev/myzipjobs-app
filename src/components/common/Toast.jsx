import { motion } from "framer-motion";

const typeStyles = {
  success: "bg-success",
  info: "bg-orange",
  error: "bg-alert",
};

function Toast({ message, type = "info", offset = 0 }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed left-1/2 z-[9999] -translate-x-1/2 rounded-xl px-5 py-3 font-body text-sm text-white shadow-lg ${typeStyles[type] || typeStyles.info}`}
      style={{ top: `${16 + offset}px` }}
    >
      {message}
    </motion.div>
  );
}

export default Toast;
