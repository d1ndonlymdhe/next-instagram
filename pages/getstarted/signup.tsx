import { ChangeEventHandler, useRef, useState } from "react"
import axios from "axios";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Error from "../../components/Error";
import Success from "../../components/Success";
import Logo from "../../components/Logo";
const server = "/api/"


export default function SignUpPage() {
    const buttonColorBlocked = 'bg-gray-200';
    const buttonColorAvialable = 'bg-green-400';
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [signUpButtonColor, setSignUpButtonColor] = useState(buttonColorBlocked)
    const [isSignUpButtonActive, setIsSignUpButtonActive] = useState(false);
    const [signUpError, setSignUpError] = useState("");
    const [signUpSuccess, setSignUpSuccess] = useState("");
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
        e.preventDefault()
        window.location.href = "/getstarted"
    }
    const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isSignUpButtonActive) {
            const username = usernameRef.current?.value;
            const password = passwordRef.current?.value;
            axios.post(`${server}/signup`, { username: username, password: password }).then(res => {
                if (res.data.status === "ok") {
                    setSignUpError("");
                    setSignUpSuccess(res.data.message.text);
                } else {
                    setSignUpError(res.data.message.text)
                }
            })
        }
    }
    return (
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
                            handleLogin(e)
                        }}>
                            <div id="loginFormWrapper" className='flex flex-col justify-around items-center content-center w-full'>
                                <Input name="username" ref={usernameRef} autoFocus={true} placeholder="Username" type="text" className='w-full h-8 mb-2 pl-2' onChange={setSignUpButtonColorOnChange}></Input>
                                <Input name="password" ref={passwordRef} placeholder="Password" type="password" className='w-full h-8 pl-2' onChange={setSignUpButtonColorOnChange}></Input>
                                <Button text="Sign Up" bonClick={handleSignup} className={`my-2 bg-neutral border-[1px] rounded-md border-black py-2 ${signUpButtonColor}`}></Button>
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
    )
}