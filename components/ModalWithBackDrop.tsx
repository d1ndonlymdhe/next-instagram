import Button from "./Button";
import { PropsWithChildren } from "react";
export default function ModalWithBackdrop(props: PropsWithChildren<{ onclick?: any, title: string }>) {
    const { onclick, title } = props;
    return (
        <div className="absolute h-screen w-screen left-0 top-0 z-90  0 flex justify-center items-center backdrop-blur-sm" onClick={() => { onclick && onclick() }}>
            <div className="bg-gray-400 max-w-[300px]  flex flex-col justify-center items-center px-2 pb-2 rounded-md border-2 border-black">
                <div className="flex flex-col my-2">
                    <div className="text-center text-xl border-b-2 border-black mb-2">{title}</div>
                    {
                        props.children
                    }
                </div>
                <Button bonClick={(e) => { e.stopPropagation(); onclick() }} text="exit"></Button>
            </div>
        </div>
    )
}
