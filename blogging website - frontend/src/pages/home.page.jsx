import React, { useEffect, useState } from 'react';
import AnimationWrapper from '../common/page-animation';
import InPageNavigation from '../components/inpage-navigation.component';
import axios from 'axios';
import Loader from '../components/loader.component'; // nếu có component này
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import { activeTabRef } from '../components/inpage-navigation.component';
function HomePage() {
    let [blogs, setBlog] = useState(null);
    let [trendingBlogs, setTrendingBlogs] = useState(null)
    let [pageState, setPageState] = useState("Trang Chủ")
    let categories = ["lập trình", "phim hollywood", "khoa học", "nấu ăn", "công nghệ", "tài chính", "du lịch", "thế giới"];

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
            .then(({ data }) => {
                setBlog(data.blogs);
            })
            .catch((err) => {
                console.error("Lỗi fetch blog:", err);
            });
    };
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => {
                setTrendingBlogs(data.blogs);
            })
            .catch((err) => {
                console.error("Lỗi fetch blog:", err);
            });

    };
    const fetchBlogByCategory = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",{tag:pageState})
            .then(({ data }) => {
                setBlog(data.blogs);
            })
            .catch((err) => {
                console.error("Lỗi fetch blog:", err);
            });
        }
    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase()
        setBlog(null)
        if (pageState == category) {
            setPageState("Trang Chủ")
            return;
        }
        setPageState(category)

    }

    useEffect(() => {
        activeTabRef.current.click()
        if (pageState == "Trang Chủ") {
            fetchLatestBlogs();
        }else{
            fetchBlogByCategory()
        }
        
        if (!trendingBlogs) {
            fetchTrendingBlogs();

        }
    }, [pageState]);

    return (
        <AnimationWrapper>
            <section className='h-cover flex justify-center gap-10'>
                <div className='w-full'>
                    <InPageNavigation routes={[pageState, "Thịnh hành"]} defaultHidden={["Thịnh hành"]}>
                        <>
                            {
                                blogs === null
                                    ? <Loader />
                                    : blogs.map((blog, i) => {
                                        return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                            <BlogPostCard content={blog} author={blog.author} />
                                        </AnimationWrapper>
                                    })
                            }
                        </>
                        <>
                            {
                                trendingBlogs === null
                                    ? <Loader />
                                    : trendingBlogs.map((blog, i) => {
                                        return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                            <MinimalBlogPost blog={blog} index={i} />
                                        </AnimationWrapper>
                                    })
                            }
                        </>

                    </InPageNavigation>
                </div>
                <div className='min-h-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden' >
                    {/* sidebar or quảng cáo gì đó nếu có */}
                    <div>
                        <div className='flex flex-col gap-4'>
                            <h1 className='font-medium text-xl mb-8'> Những câu chuyện thú vị</h1>
                            <div className="flex gap-3 flex-wrap">
                                {
                                    categories.map((category, i) => {
                                        return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                            <button onClick={loadBlogByCategory} className={"btn-light py-1 px-3 rounded-full " + (pageState == category ? "bg-black text-white" : "bg-white text-black")}>{category}</button>
                                        </AnimationWrapper>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className='font-medium text-xl mb-8' >Xu hướng <i className='fi fi-rr-arrow-trend-up'></i></h1>
                    </div>
                </div>
                <div></div>
            </section>
        </AnimationWrapper>

    );
}

export default HomePage;
