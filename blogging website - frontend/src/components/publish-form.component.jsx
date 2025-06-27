import React, { useContext } from 'react';
import AnimationWrapper from '../common/page-animation';
import { EditorContext } from '../pages/editor.pages';
import { Toaster, toast } from 'react-hot-toast';
import Tag from './tags.component';

function PublishForm() {
  const characterLimit = 200;
  const tagLimit = 5;
  const { blog, setEditorState, setBlog } = useContext(EditorContext);
  const { banner, title, tags, des } = blog;

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    setBlog({ ...blog, title: e.target.value });
  };

  const handleBlogDesChange = (e) => {
    setBlog({ ...blog, des: e.target.value });
  };

  const handleKeydown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const input = e.target;
      let value = input.value.trim();

      if (value.endsWith(",")) value = value.slice(0, -1);
      if (!value) {
        toast.error("Tag không được rỗng nha");
        return;
      }

      if (tags.includes(value)) {
        toast.error("Tag đã tồn tại");
        return;
      }

      if (tags.length >= tagLimit) {
        toast.error(`Tối đa ${tagLimit} tag nha`);
        return;
      }

      setBlog({ ...blog, tags: [...tags, value] });
      input.value = '';
    }
  };

  return (
    <AnimationWrapper>
      <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
        <Toaster />
        <button className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]' onClick={handleCloseEvent}>
          <i className='fi fi-br-cross'></i>
        </button>

        <div className='max-w-[500px] center'>
          <p className="text-dark-grey mb-1">Preview</p>
          <div className='w-full aspect-video round-lg overflow-hidden bg-grey mt-4'>
            <img src={banner} alt="" />
          </div>
          <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-1'>{title}</h1>
          <p className='text-dark-grey text-xl font-gelasio leading-7 mt-4 line-clamp-2'>{des}</p>
        </div>

        <div className='border-grey lg:border-1 lg:pl-8'>
          <p className='text-dark-grey mb-2 mt-9'>Tiêu đề</p>
          <input
            type="text"
            placeholder='Blog Title'
            defaultValue={title}
            className='input-box pl-4'
            onChange={handleBlogTitleChange}
          />

          <p className='text-dark-grey mb-2 mt-9'>Mô tả ngắn</p>
          <textarea
            maxLength={characterLimit}
            defaultValue={des}
            className='h-40 resize-none leading-7 input-box pl-4'
            onChange={handleBlogDesChange}
          ></textarea>

          <p className='mt-1 text-dark-grey text-sm text-right'>
            {characterLimit - des.length} character left
          </p>

          <p className='text-dark-grey mb-2 mt-9'>Chủ đề - (Giúp dễ tìm kiếm và đánh giá blog của bạn)</p>
          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type='text'
              placeholder='Chủ đề'
              className='sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white'
              onKeyDown={handleKeydown}
            />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Tag key={i} tagIndex={i} tag={tag} />
              ))}
            </div>
            
          </div>
          <p className='mt-1 mb-4 text-dark-grey text-right '>{tagLimit - tags.length} tags left</p>
            <button className='btn-dark px-8 '>Xuất bản</button>
        </div>
      </section>
    </AnimationWrapper>
  );
}

export default PublishForm;
