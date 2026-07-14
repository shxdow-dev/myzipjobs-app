import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

function WorkDoneConfirmModal({ onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end bg-black/60"
        onClick={onCancel}
      >
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full rounded-t-2xl bg-warmWhite p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-success" />
            <h2 className="mt-4 font-heading text-xl font-bold text-charcoal">
              Mark Work as Done?
            </h2>
            <p className="mt-2 text-center font-body text-charcoalMuted">
              This will remove this match from your list and notify the employer.
            </p>
            <p className="mt-1 text-center text-sm text-alert">
              This cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-success font-heading text-white transition hover:opacity-90"
          >
            <CheckCircle className="h-5 w-5" />
            Yes, Work is Done
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 h-[52px] w-full rounded-xl border border-charcoalMuted font-heading text-charcoalMuted transition hover:bg-orangeLight"
          >
            Not Yet
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WorkDoneConfirmModal;
