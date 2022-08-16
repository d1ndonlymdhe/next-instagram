import { PropsWithChildren } from "react";

export function Wrapper(props: PropsWithChildren) {
    return <div className="grid grid-rows-[6%_88%_6%] h-full w-full max-w-[500px] overflow-hidden bg-white box-border rounded-lg px-2 pt-2 font-Roboto">{props.children}</div>
}
