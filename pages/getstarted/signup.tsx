import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import axios from "axios";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Error from "../../components/Error";
import Success from "../../components/Success";
import Logo from "../../components/Logo";
import { useRouter } from "next/router";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";
import { connect } from "../../utils/db";
import { user } from "../../utils/type";
import User from "../../utils/User";
const server = "/api/"


export default function SignUpPage() {
    const buttonColorBlocked = 'bg-gray-200';
    const buttonColorAvialable = 'bg-green-400';
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const router = useRouter()
    const [signUpButtonColor, setSignUpButtonColor] = useState(buttonColorBlocked)
    const [isSignUpButtonActive, setIsSignUpButtonActive] = useState(false);
    const [signUpError, setSignUpError] = useState("");
    const [signUpSuccess, setSignUpSuccess] = useState("");
    const [signupLoading, setSignUpLoading] = useState(false)
    useEffect(() => {
        usernameRef.current?.focus()
        if (usernameRef.current?.value.length && passwordRef.current?.value.length) {
            setIsSignUpButtonActive(true);
            setSignUpButtonColor(buttonColorAvialable);
        }
    }, [])
    const setSignUpButtonColorOnChange = (e: ChangeEventHandler) => {
        if (usernameRef.current?.value && usernameRef.current.value.length > 0 && passwordRef.current?.value && passwordRef.current.value.length >= 8) {
            setSignUpButtonColor(buttonColorAvialable);
            setIsSignUpButtonActive(true);
        } else {
            setSignUpButtonColor(buttonColorBlocked);
            setIsSignUpButtonActive(false);
        }
    }
    const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        router.push("/getstarted")
        // window.location.href = "/getstarted"
    }
    const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!signupLoading) {
            setSignUpLoading(true)
            if (isSignUpButtonActive) {
                const username = usernameRef.current?.value;
                const password = passwordRef.current?.value;
                axios.get(`${server}/signup`, { params: { username: username, password: password } }).then(res => {
                    setSignUpLoading(false)
                    if (res.data.status === "ok") {
                        setSignUpError("");
                        setSignUpSuccess("GO TO LOGIN PAGE");
                    } else {
                        setSignUpError(res.data.message.text)
                    }
                })
            } else {
                setSignUpSuccess("");
                setSignUpError("Username and Password must be minimum 8 characters")
            }
        }

    }
    return (
        <>
            <Head>
                <title>Instagram</title>
            </Head>
            <div className='w-screen h-screen flex flex-row justify-center items-center '>
                <div className='w-[95%] h-fit flex flex-row justify-center items-center md:border-gray-200 border-solid border-2 max-w-[350px]'>
                    <div className="my-5 flex flex-col justify-center items-center content-center w-full max-w-[300px]">
                        {/* <div className='font-billabong text-5xl mb-10'>Instagram</div>
                     */}
                        <Logo></Logo>
                        {(signUpError !== "") && <Error message={signUpError} className={`my-5 w-[98%] text-center py-2`}></Error>}
                        {(signUpSuccess !== "") && <Success message={signUpSuccess} className={`my-5 w-[98%] text-center py-2`}></Success>}
                        <div id="loginContainer" className='w-full'>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                //@ts-ignore
                                handleSignup(e);
                            }}>
                                <div id="loginFormWrapper" className='flex flex-col justify-around items-center content-center w-full'>
                                    <Input name="username" ref={usernameRef} autoFocus={true} placeholder="Username" type="text" className='w-full h-8 mb-2 pl-2' onChange={setSignUpButtonColorOnChange}></Input>
                                    <Input name="password" ref={passwordRef} placeholder="Password" type="password" className='w-full h-8 pl-2' onChange={setSignUpButtonColorOnChange}></Input>
                                    <Button text={`${signupLoading && "Loading" || "Sign Up"}`} type="submit" bonClick={(e) => { }} className={`my-2 bg-neutral border-[1px] rounded-md border-black py-2 ${signupLoading && "bg-yellow-400" || signUpButtonColor}`}></Button>
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
                                <Button text='Back to log in' className={`bg-[#0095f6] w-full my-2 py-1`} bonClick={handleLogin}></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const hash = context.req.cookies.hash;
    if (hash) {
        const connection = await connect()
        const user = await User.findOne({ hash }, "username") as user;
        if (user) {
            if (user.firstLogin) {
                return {
                    redirect: {
                        permanent: false,
                        destination: "/setup"
                    }
                }
            } else {
                return {
                    redirect: {
                        permanent: false,
                        destination: "/home"
                    }
                }
            }
        }
    }
    return {
        props: {

        }
    }
}