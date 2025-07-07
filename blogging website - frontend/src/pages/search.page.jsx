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

const SearchPage = () => {
    let {query}= useParams()
    let [blogs, setBlogs] = useState(null);
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


    useEffect(() => {
            searchBlogs({ page: 1 });
    }, [query]);

  return (
    <section className='h-cover flex justify-center gap-10'>
    <div className='w-full'>
   <InPageNavigation routes={[`Tìm kiếm cho "${query}"`]} defaultHidden={["Thêm bài viet"]}>
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
   </InPageNavigation>
    </div>

    </section>
  )
}

export default SearchPage