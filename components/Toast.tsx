import { AnimatePresence, motion } from "framer-motion"
import { SetStateAction } from "react";
export default function Toast(props: { message: string, className?: string, setToast: React.Dispatch<SetStateAction<string>> }) {
    const { message, className, setToast } = props;
    console.log("Toasting")
    return <div className="absolute h-screen w-screen left-0 top-0 0 flex flex-col items-center justify-end overflow-hidden">
        <AnimatePresence>
            <motion.div onClick={() => {
                setToast("");
            }} key={1234} initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`relative bg-red-400 z-[100] rounded-lg px-2 py-1 mb-20 ${className}`}>
                {message}
            </motion.div>
        </AnimatePresence>
    </div>
}