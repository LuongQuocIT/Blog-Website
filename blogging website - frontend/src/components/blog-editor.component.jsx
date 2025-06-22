import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../imgs/logo.png'
import AnimationWrapper from '../common/page-animation'
import defaultBanner from '../imgs/blog banner.png'
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { useContext } from 'react'
import { EditorContext } from '../pages/editor.pages'
import { useEffect } from 'react'
import EditorJS from '@editorjs/editorjs'
import { tools } from './tools.component'

function BlogEditor() {
    const [bannerURL, setBannerURL] = useState(defaultBanner);
    let { blog, blog: { title, banner, content, tags, des }, setBlog } = useContext(EditorContext);
    useEffect(() => {
        let editor = new EditorJS({
            holder: 'textEditor',
            data: "",
            tools: tools,
            placeholder: 'Nhập nội dung bài viết của bạn tại đây...',
        })

    }, []);
    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // const compressedFile = await imageCompression(file, {
        //   maxSizeMB: 1
        // });

        setBannerURL(URL.createObjectURL(file)); // Preview ảnh liền

        const toastId = toast.loading("Đang tải ảnh lên...");

        const url = await uploadToCloudinary(file);

        toast.dismiss(toastId); // ❌ Tắt cái toast loading

        if (url) {
            setBannerURL(url);
            toast.success("Tải ảnh thành công 😎");
            setBlog({ ...blog, banner: url }); // Cập nhật URL ảnh vào blog state
        } else {
            toast.error("Tải ảnh thất bại 😢");
        }
    };


    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("upload_preset", "blog_upload");
        const res = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("❌ Upload failed:", data.error);
            throw new Error(data.error);
        }

        return data.url; // URL ảnh Cloudinary trả về
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Ngăn không cho textarea tự động xuống dòng

        }
    }
    const handleTitleChange = (e) => {
        const input = e.target;
        input.style.height = 'auto'; // Reset lại height
        input.style.height = input.scrollHeight + "px"; // Set lại height đúng theo nội dung
        setBlog({ ...blog, title: input.value }); // Cập nhật title trong blog state
    };


    return (
        <>
            <nav className="navbar">
                <Link to="/" className='flex-none w-10'>
                    <img src={logo} alt="" />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {title.length ? title : "New Blog"}

                </p>
                <div className="flex gap-4 ml-auto">
                    <button className='btn-dark py-2'>
                        Pushlish
                    </button>
                    <button className='btn-light py-2'>
                        Save Draft
                    </button>
                </div>
            </nav>
            <Toaster />
            <AnimationWrapper className="h-cover flex items-center justify-center">
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img src={bannerURL} alt="Banner" className='z-20' />
                                <input type="file" id='uploadBanner' accept='.png ,.jpg, .jpeg' hidden onChange={handleBannerUpload} />
                            </label>
                        </div>
                        <textarea name="" id="" placeholder='Tiêu đề bài viết của bạn' className='text-4xl font-medium w-full mt-8 mb-5 border-b-2 border-grey focus:outline-none resize-none leading-tight focus:border-e-dark-grey placeholder:opacity-40' rows="1" onKeyDown={handleTitleKeyDown} onChange={handleTitleChange} style={{ height: 'auto' }}>

                        </textarea>
                        <div id='textEditor' className='font-gelasio'></div>


                    </div>
                </section>
            </AnimationWrapper>

        </>

    )
}

export default BlogEditor