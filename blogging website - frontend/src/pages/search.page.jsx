import React, { useEffect, useState } from 'react'
import InPageNavigation from '../components/inpage-navigation.component';
import { useParams } from 'react-router-dom';
import Loader from '../components/loader.component';
import LoadMoreDataBtn from '../components/load-more.component';
import AnimationWrapper from '../common/page-animation';
import BlogPostCard from '../components/blog-post.component';
import axios from 'axios';
import filterPaginationData from '../common/filter-pagination-data';
import NoDataMessage from '../components/nodata.component';
import UserCard from '../components/usercard.component';

const SearchPage = () => {
    let { query } = useParams()
    query = decodeURIComponent(query);
    console.log(query);
    let [blogs, setBlogs] = useState(null);
    let [users, setUsers] = useState(null);
    const searchBlogs = ({ page = 1, create_new_arr = false }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page })
            .then(async ({ data }) => {
                let formatData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { query },
                    create_new_arr
                })
                setBlogs(formatData);
            }).catch((err) => {
                console.error("Lỗi fetch blog:", err);
            });
    }
    const fetchUsers = ({ page = 1, create_new_arr = false }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
            .then(({ data: { users } }) => {

                setUsers(users);
            }).catch((err) => {
                console.error("Lỗi fetch blog:", err);
            })
    }


    useEffect(() => {
        resetState();
        if (!query || query.trim() === "") return;
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers({ page: 1, create_new_arr: true });
    }, [query]);


    const resetState = () => {
        setUsers(null);
        setBlogs(null);
    }
    const UserCardWrapper = () => {
        return (
            <>
                {users === null
                    ? (<Loader />)
                    : (users?.length) ?
                        users.map((user, i) => {
                            return (
                                <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                    <UserCard user={user} />
                                </AnimationWrapper>
                            );
                        })
                        : <NoDataMessage message={"Không có người dùng này"} />
                }
            </>
        )
    }

    return (
        <section className='h-cover flex justify-center gap-10'>
            <div className='w-full'>
                <InPageNavigation routes={[`Tìm kiếm cho "${query}"`, "Người dùng"]} defaultHidden={["Thêm bài viet"]}>
                    <>
                        {
                            blogs === null
                                ? (<Loader />)
                                : (blogs.results?.length ?
                                    blogs.results.map((blog, i) => {

                                        return (
                                            <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={blog.blog_id}>
                                                <BlogPostCard content={blog} index={i} />
                                            </AnimationWrapper>
                                        );
                                    })
                                    : <NoDataMessage message={"Không có bài viết này"} />

                                )}
                        {/* <LoadMoreDataBtn state={blogs} fetchDataFun={ (pageState == "Trang Chủ" ? fetchLatestBlogs : fetchBlogByCategory) }  /> */}
                    </>
                    <UserCardWrapper />
                </InPageNavigation>
            </div>
            <div className='min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
                <h1 className='font-medium text-xl mb-8'>Người dùng đã tìm kiếm  <i className='fi fi-rr-user nt-1'></i></h1>
                <UserCardWrapper />
            </div>

        </section>
    )
}

export default SearchPage