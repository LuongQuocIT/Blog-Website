import React, { useContext } from 'react'
import { BlogContext } from '../pages/blog.page';
import CommentField from './comment-field.component';

function CommentsContainer() {
    let {blog:{title},commentsWrapper, setCommentsWrapper} = useContext(BlogContext);
  return (
    <div className={'max-sm:w-full fixed ' + (commentsWrapper ? 'sm:right-0 top-0' : 'sm:right-[-100%] top-[100%]') + ' duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full bg-white z-50  shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden'}>
      <div className='relative'>
        <h1 className='text-2xl font-bold'>Comments</h1>
        <p className='text-lg mt-2 w-[70%] text-dark-grey line-clamp-1'>{title}</p>
        <button className='absolute right-0 flex justify-center items-center h-10 w-10 top-0 text-3xl' onClick={() => setCommentsWrapper(false)}>&times;</button>

      </div>
      <hr  className='border-grey my-8 w-[120%] -ml-10'/>
      <CommentField action="Comment"/>
    </div>
  )
}

export default CommentsContainer