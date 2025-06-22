import React from 'react'
import { UserContext } from '../App';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';
import { createContext } from 'react';

const blogStructure = {
    title: "",
    banner:"",
    content: [],
    tags: [],
    des: "",
    author:{personal_info:{}}
}

export const EditorContext = createContext({

})
export const Editor = () => {
    const [blog, setBlog] = useState(blogStructure);
    const { editorState, setEditorState } = useState("editor");
    let {userAuth} = useContext(UserContext);
    const access_token = userAuth?.access_token;

  return (
    <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState}}>{
        access_token === null ? <Navigate to="/signin" />
    : (
        editorState !== "editor" ? <BlogEditor/> :<PublishForm/>
        )
}</EditorContext.Provider>
    
  )
}
