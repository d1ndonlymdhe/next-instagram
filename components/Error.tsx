import React from "react";
import { ErrorPropsTypes } from "../typings/components";
export default function Error(props: ErrorPropsTypes) {
    const { message, className } = props;
    return <div className={`bg-red-500 text-white rounded-md ${className}`}>{message}</div>
}
