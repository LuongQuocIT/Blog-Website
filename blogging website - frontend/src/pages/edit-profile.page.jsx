import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../App';
import axios from 'axios';
import { profileDataStructure } from './profile.page';
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import toast, { Toaster } from 'react-hot-toast';
import InputBox from '../components/input.component';
import { storeInSession } from '../common/session';

function EditProfile() {
    let { userAuth, setUserAuth } = useContext(UserContext);
    let access_token = userAuth?.access_token;
    let bioLimit = 150;
    let editProfileForm = useRef();

    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [charactersLeft, setCharactersLeft] = useState(bioLimit);
    const [updateProfileImg, setUpdateProfileImg] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    let {
        personal_info: {
            profile_img,
            fullname,
            username: profile_username,
            email,
            bio
        },
        social_links,
    } = profile;

    // ✅ Upload Cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("upload_preset", "blog_upload");

        const res = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.url;
    };

    const handleCharacterChange = (e) => {
        setCharactersLeft(bioLimit - e.target.value.length);
    }

    const handleImagePreview = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setProfile({
                ...profile,
                personal_info: { ...profile.personal_info, profile_img: reader.result }
            });
        };
        reader.readAsDataURL(file);
        setUpdateProfileImg(file);
    }

    const handleImageUpload = async () => {
        if (!updateProfileImg) {
            return toast.error("Vui lòng chọn ảnh trước!");
        }
        setIsUploading(true);
        const loadingToast = toast.loading("Đang tải ảnh lên...");
        try {
            const url = await uploadToCloudinary(updateProfileImg);

            // 🟢 Gửi đúng key "profile_img" để backend nhận
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
                { profile_img: url },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );

            let newUserAuth = { ...userAuth, profile_img: data.profile_img };
            storeInSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);
            setUpdateProfileImg(null);

            toast.dismiss(loadingToast);
            toast.success("Ảnh đã được cập nhật");
        } catch (err) {
            console.error("Error uploading image:", err);
            toast.dismiss(loadingToast);
            toast.error("Lỗi khi tải ảnh lên");
        } finally {
            setIsUploading(false);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading("Đang cập nhật hồ sơ...");

        try {
            const formData = {
                fullname: profile.personal_info.fullname,
                username: profile.personal_info.username,
                bio: profile.personal_info.bio,
                profile_img: profile.personal_info.profile_img,
                social_links: profile.social_links // vẫn giữ nguyên object
            };

            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
                formData,
                { headers: { Authorization: `Bearer ${access_token}` } }
            );

            toast.dismiss(loadingToast);
            toast.success("Hồ sơ đã được cập nhật thành công");
            setProfile(data);
            console.log("Updated profile:", data);
            setCharactersLeft(bioLimit - (data.personal_info.bio?.length || 0));
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.dismiss(loadingToast);
            toast.error("Lỗi khi cập nhật hồ sơ");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        if (access_token) {
            axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/get-profile",
                { username: userAuth?.username },
                { headers: { Authorization: `Bearer ${access_token}` } }
            ).then(({ data }) => {
                setProfile(data);
                setCharactersLeft(bioLimit - (data.personal_info.bio?.length || 0));
                setLoading(false);
            }).catch((err) => {
                console.error("Error fetching profile data:", err);
                setLoading(false);
            });
        }
    }, [access_token, userAuth?.username]);

    return (
        <AnimationWrapper>
            {loading ? (
                <Loader />
            ) : (
                <form ref={editProfileForm} className="max-w-4xl mx-auto px-5">
                    <Toaster />
                    <h1 className="flex text-2xl font-bold mb-6 max-md:hidden">Chỉnh sửa hồ sơ</h1>

                    <div className="flex flex-col lg:flex-row items-start gap-8 py-10 lg:gap-10">
                        {/* Avatar */}
                        <div className="max-lg:center mb-5">
                            <label
                                htmlFor="uploadImg"
                                id="profileImgLable"
                                className="relative w-48 h-48 block bg-grey rounded-full overflow-hidden "
                            >
                                <img src={profile_img} alt="profile" />
                                <div className="w-full h-full absolute top-0 left-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 text-white cursor-pointer">
                                    Tải ảnh lên
                                </div>
                            </label>
                            <input
                                type="file"
                                id="uploadImg"
                                className="hidden"
                                accept=".jpg, .jpeg, .png"
                                onChange={handleImagePreview}
                            />

                            <button
                                type="button"
                                onClick={handleImageUpload}
                                className={`btn-light mt-5 px-8 max-lg:center lg:w-full ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                disabled={isUploading}
                            >
                                {isUploading ? "Đang tải..." : "Tải ảnh lên"}
                            </button>
                        </div>

                        {/* Form */}
                        <div className="w-full">
                            <div className="grid grid-cols-1 gap-5 max-lg:grid-cols-1 max-lg:gap-3">
                                <div>
                                    <InputBox
                                        name="fullname"
                                        type="text"
                                        id="fullname"
                                        value={fullname || ""}
                                        placeholder="Fullname"
                                        icon="fi-rr-user"
                                        disabled={true}
                                    />
                                    <InputBox
                                        name="email"
                                        type="email"
                                        id="email"
                                        value={email || ""}
                                        placeholder="Email"
                                        icon="fi-rr-envelope"
                                        disabled={true}
                                    />
                                    <InputBox
                                        name="username"
                                        type="text"
                                        id="username"
                                        value={profile_username || ""}
                                        placeholder="Tên người dùng"
                                        icon="fi-rr-at"
                                        disabled={true}
                                    />
                                    <p className="text-sm mb-1">
                                        Tên người dùng hiển thị với người khác
                                    </p>

                                    <div className="relative w-full">
                                        <textarea
                                            name="bio"
                                            maxLength={bioLimit}
                                            value={bio || ""}
                                            className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5 w-full"
                                            placeholder="Tiểu sử"
                                            onChange={(e) => {
                                                handleCharacterChange(e);
                                                setProfile({
                                                    ...profile,
                                                    personal_info: {
                                                        ...profile.personal_info,
                                                        bio: e.target.value
                                                    }
                                                });
                                            }}
                                        ></textarea>

                                        <p className="text-sm text-gray-500 absolute bottom-3 right-3">
                                            {charactersLeft} kí tự còn lại
                                        </p>
                                    </div>

                                    <p className="text-sm mb-1">Nhập liên kết mạng xã hội của bạn </p>

                                    <div className="md:grid md:grid-cols-2 gap-x-6">
                                        {Object.keys(social_links).map((key) => (
                                            <InputBox
                                                key={key}
                                                name={key}
                                                type="text"
                                                id={key}
                                                value={social_links[key] || ""}
                                                placeholder={`Link ${key}`}
                                                icon={key !== "website" ? `fi-brands-${key}` : `fi fi-rr-globe`}
                                                onChange={(e) =>
                                                    setProfile({
                                                        ...profile,
                                                        social_links: {
                                                            ...profile.social_links,
                                                            [key]: e.target.value, // ✅ update đúng key
                                                        },
                                                    })
                                                }
                                            />
                                        ))}

                                    </div>


                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="btn-primary px-8 max-lg:center lg:w-[40%] bg-black hover:bg-black/70 text-white py-3 rounded-full mt-5"
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </AnimationWrapper>
    )
}

export default EditProfile;
