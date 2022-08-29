import Button from "./Button";
import { PropsWithChildren } from "react";
import { AnimatePresence, motion, } from "framer-motion";
export default function ModalWithBackdrop(props: PropsWithChildren<{ onclick?: any, title: string, className?: string }>) {
    const { onclick, title, className } = props;
    const dropInAnimation = {
        hidden: {
            y: "-100vh",
        },
        visible: {
            y: "0",
        },
        exit: {
            y: "100vh",
        }
    }
    //initial={{ y: -100 }} animate={{ y: 0 }}
    return (
        <AnimatePresence>
            <motion.div initial={{ backdropFilter: "blur(0px)" }} animate={{ backdropFilter: "blur(4px)" }} exit={{ backdropFilter: "blur(0px)" }} transition={{ type: "spring", damping: 7, stiffness: 100, duration: 0.5 }} className="absolute h-screen w-screen left-0 top-0 z-[100]  0 flex justify-center items-center backdrop-blur-sm" onClick={() => { onclick && onclick() }}>
                <motion.div transition={{ type: "spring", damping: 7, stiffness: 100, duration: 0.5 }} initial={{ y: -100 }} animate={{ y: 0 }} className={"bg-gray-400 max-w-[300px] flex flex-col justify-center items-center px-2 pb-2 rounded-md border-2 border-black" + " " + className} onClick={(e) => { e.stopPropagation() }}>
                    <div className="flex flex-col my-2 w-full">
                        <div className="text-center text-xl border-b-2 border-black mb-2 w-[98%]">{title}</div>
                        {
                            props.children
                        }
                    </div>
                    <Button bonClick={(e) => { onclick() }} text="Exit" className="bg-red-400"></Button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
