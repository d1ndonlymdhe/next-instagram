import Button from "../../components/Button";
import Error from '../../components/Error';
import Input from "../../components/Input";
import axios from "axios";
import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ChangeEventHandler } from "react";
import Logo from "../../components/Logo";
import { useRouter } from "next/router";
import Head from "next/head";
import { NextApiRequest } from "next";
const server = "/api/"
function Index() {
    const buttonColorBlocked = 'bg-[#afdcf9]';
    const buttonColorAvailable = 'bg-[#0095f6]';
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [loginButtonColor, setLoginButtonColor] = useState(buttonColorBlocked)
    const [isLoginButtonActive, setIsLoginButtonActive] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [hash, setHash] = useState("");
    const router = useRouter()
    useEffect(() => {
        if (loginSuccess) {
            Cookies.set("hash", hash, { expires: 30 });
            router.push("/");
        }
    }, [loginSuccess, hash]);
    const setLoginButtonColorOnChange = (e: ChangeEventHandler) => {
        if (usernameRef.current?.value && usernameRef.current.value.length > 0 && passwordRef.current?.value && passwordRef.current.value.length >= 8) {
            setLoginButtonColor(buttonColorAvailable);
            setIsLoginButtonActive(true);
        } else {
            setLoginButtonColor(buttonColorBlocked);
            setIsLoginButtonActive(false);
        }
    }
    const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isLoginButtonActive) {
            const username = usernameRef.current?.value;
            const password = passwordRef.current?.value;
            if (username !== undefined && password !== undefined) {
                console.log("ok");
                axios.post(`${server}/login`, { username: username, password: password }).then(res => {
                    if (res.data.status === "error") {
                        setLoginError(res.data.message.text);
                    } else {
                        setLoginError("");
                        setLoginSuccess(true);
                        console.log(loginSuccess)
                        setHash(res.data.message.hash);
                    }
                });
            } else {
                setLoginError("Enter a username and password");
            }
        }
    }
    const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
        window.location.href = window.location.href + "/signup";
    }
    return (
        <>
            <Head>
                <title>Instagram</title>
            </Head>
            <div className='w-screen h-screen flex flex-row justify-center items-center'>

                <div className='w-[95%] h-fit flex flex-row justify-center items-center md:border-gray-200 border-solid border-2 max-w-[350px]'>
                    <div className="my-5 flex flex-col justify-center items-center content-center w-full max-w-[300px]">
                        {/* <div className='font-billabong text-5xl mb-10'>Instagram</div>
                     */}
                        <Logo></Logo>
                        {(loginError !== "") && <Error message={loginError} className={`my-5 w-[98%] text-center py-2`}></Error>}
                        <div id="loginContainer" className='w-full'>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                //@ts-ignore
                                handleLogin(e)
                            }}>
                                <div id="loginFormWrapper" className='flex flex-col justify-around items-center content-center w-full'>
                                    <Input name="username" ref={usernameRef} autoFocus={true} placeholder="Username" type="text" className='w-full h-8 mb-2 pl-2' onChange={setLoginButtonColorOnChange}></Input>
                                    <Input name="password" ref={passwordRef} placeholder="Password" type="password" className='w-full h-8 pl-2' onChange={setLoginButtonColorOnChange}></Input>
                                    <Button type="submit" text='Log in' className={`${loginButtonColor} w-full my-2 py-1`} bonClick={handleLogin}></Button>
                                </div>
                            </form>
                        </div>
                        <div id="signupContainer" className='w-full flex flex-col justify-center items-center'>
                            <div id="---Or----" className='grid grid-cols-[4fr_2fr_4fr] w-full justify-items-center items-center'>
                                <div className='h-[2px] border-2 border-solid border-gray-200 w-full'></div>
                                <div>or</div>
                                <div className='h-[2px] border-2 border-solid border-gray-200 w-full'></div>
                            </div>
                            <div id="signupButtonWrapper">
                                <Button text="Sign Up" bonClick={handleSignup} className={`my-2 bg-neutral py-2 hover:bg-gray-300`}></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context: { req: NextApiRequest }) {
    return {
        props: {}
    }
}


export default Index;