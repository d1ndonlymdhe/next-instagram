import react from "react"
type LogoPropsTypes = {
    className?: string;
}
export default function Logo(props: LogoPropsTypes) {
    const { className } = props;
    return <span className={`font-billabong flex justify-center items-center h-full ${className}`}>
        <div className="text-[3rem]">Instagram</div></span>
}