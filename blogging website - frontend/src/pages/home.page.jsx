import React, { useEffect, useState } from 'react';
import AnimationWrapper from '../common/page-animation';
import InPageNavigation from '../components/inpage-navigation.component';
import axios from 'axios';
import Loader from '../components/loader.component'; // nếu có component này
import BlogPostCard from '../components/blog-post.component';

function HomePage() {
    const [blogs, setBlog] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
            .then(({ data }) => {
                setBlog(data.blogs);
            })
            .catch((err) => {
                console.error("Lỗi fetch blog:", err);
            });
    };

    useEffect(() => {
        fetchLatestBlogs();
    }, []);

    return (
        <AnimationWrapper>
            <section className='h-cover flex justify-center gap-10'>
                <div className='w-full'>
                    <InPageNavigation routes={["Trang Chủ", "Thịnh hành"]} defaultHidden={["Thịnh hành"]}>
                        <>
                            {
                                blogs === null
                                    ? <Loader />
                                    : blogs.map((blog, i) => {
                                        return <AnimationWrapper transition={{duration:1,delay:i*.1}} key={i}>
                                            <BlogPostCard content={blog} author={blog.author} />
                                        </AnimationWrapper>
                                    })
                            }
                        </>
                    </InPageNavigation>
                </div>
                <div>
                    {/* sidebar or quảng cáo gì đó nếu có */}
                </div>
            </section>
        </AnimationWrapper>
    );
}

export default HomePage;
