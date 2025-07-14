import React, { useEffect } from 'react'
import { UserContext } from '../App';
import { useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';
import { createContext } from 'react';
import { use } from 'react';
import Loader from '../components/loader.component';
import axios from 'axios';

const blogStructure = {
    title: "",
    banner:"",
    content: [],
    tags: [],
    des: "",
    author:{personal_info:{}}
}

export const EditorContext = createContext({
blog: blogStructure,
  setBlog: () => {},
  editorState: "editor",
  setEditorState: () => {},
  textEditor: { isReady: false },
  setTextEditor: () => {}
})
export const Editor = () => {
  let {blog_id}= useParams();
  const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState(blogStructure);
    const [ editorState, setEditorState ] = useState("editor");
    const [textEditor, setTextEditor] = useState({isReady: false});
    let {userAuth} = useContext(UserContext);
    const access_token = userAuth?.access_token;

    useEffect(() => {
        if (!blog_id) {
          return setLoading(false);
        }
        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id,draft:true,mode:'edit' })
          .then(({ data: { blog } }) => {
            setBlog(blog);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching blog data:", err);
            setBlog(null);
            setLoading(false);
          });
      
      },[])

  return (
    <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState,textEditor, setTextEditor}}>{
        access_token === null ? <Navigate to="/signin" />
    : 
    loading? <Loader/>:
    (
        editorState == "editor" ? <BlogEditor/> :<PublishForm/>
        )
}</EditorContext.Provider>
    
  )
}
