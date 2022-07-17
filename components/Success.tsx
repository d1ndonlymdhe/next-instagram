import React from "react";
import { ErrorPropsTypes } from "../typings/components";
export default function Success(props: ErrorPropsTypes) {
    const { message, className } = props;
    return <div className={`bg-green-400 text-white rounded-md ${className}`}>{message}</div>
}
