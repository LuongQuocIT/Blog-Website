import React, { useRef } from 'react'
import InputBox from '../components/input.component'
import googleIcon from "../imgs/google.png"
import { Link, Navigate } from 'react-router-dom'
import { toast, Toaster } from 'react-hot-toast'
import AnimationWrapper from '../common/page-animation'
import axios from 'axios'
import { useContext } from 'react'
import { UserContext } from '../App'
import { storeInSession } from '../common/session'
import { authWithGoogle } from '../common/firebase'
export default function UserAuthForm({ type }) {
    const { userAuth, setUserAuth } = useContext(UserContext);
    const access_token = userAuth?.access_token;
    const userAuthThroughServer = (serverRoute, formData) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
            .then(({ data }) => {
                storeInSession("user", JSON.stringify(data));
                setUserAuth(data);
            }).catch(( error ) => {
                const message = error?.response?.data?.error || "Đã có lỗi xảy ra, thử lại sau";
                toast.error(message);
                console.log(error); // debug chi tiết
            })
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        let serverRoute = type === "sign-in" ? "/signin" : "/signup";
        // Regex check
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        let form = new FormData(formElement)
        let formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        let { fullname, email, password } = formData;
        if (fullname && fullname.length < 3) {
            return toast.error("Fullname ít nhất 3 ký tự");
        }

        if (!email || !emailRegex.test(email)) {
            return toast.error("Email không hợp lệ");
        }

        if (!password || !passwordRegex.test(password)) {
            return toast.error("Mật khẩu từ 6-20 ký tự, có ít nhất 1 số, 1 chữ thường, 1 chữ hoa"
            );
        }
        userAuthThroughServer(serverRoute, formData)


    }
    const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle().then(data => {
        let serverRoute = "/google-auth";
        let formData = {
            access_token: data.accessToken
        };

        userAuthThroughServer(serverRoute, formData);
    }).catch(err => {
        toast.error("Đăng nhập Google thất bại");
        console.log(err);
    });
};

    return (
        access_token ?
            <Navigate to="/" />
            :
            <AnimationWrapper keyValue={type}>
                <section className='h-cover flex items-center justify-center'>
                    <Toaster />
                    <form id='formElement' className='w-[80%] max-w-[400px]'>
                        <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                            {type == "sign-in" ? "Welcome back" : "Join us"}
                        </h1>
                        {
                            type !== "sign-in" ?
                                <InputBox name="fullname" type="text" placeholder="Full name" icon="fi-rr-user" />
                                : ""
                        }
                        <InputBox name="email" type="email" placeholder="Email" icon="fi-rr-envelope" />
                        <InputBox name="password" type="password" placeholder="Password" icon="fi-rr-key" />
                        <button className='btn-dark center mt-14' type='submit' onClick={handleSubmit} >
                            {type.replace("-", " ")}
                        </button>
                        <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                            <p>or</p>
                            <hr className='w-1/2 border-black' />
                        </div>
                        <button type='button' className='btn-dark flex items-center justify-center gap-4 w-[90%] center' onClick={handleGoogleAuth}>
                            <img src={googleIcon} className='w-5' />
                            continue with google
                        </button>
                        {
                            type === "sign-in" ? (
                                <p className='mt-6 text-dark-grey text-xl text-center'>
                                    Chưa có tài khoản
                                    <Link to="/signup" className="underline text-black text-xl ml-1">Đăng kí</Link>
                                </p>
                            ) : (
                                <p className='mt-6 text-dark-grey text-xl text-center'>
                                    Đã có tài khoản
                                    <Link to="/signin" className="underline text-black text-xl ml-1">Đăng nhập</Link>
                                </p>
                            )
                        }

                    </form >
                </section >
            </AnimationWrapper>

    )
}
