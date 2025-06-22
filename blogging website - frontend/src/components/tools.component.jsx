import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";


const uploadImagebyURL = (e) => {
    let link = new Promise((resolve, reject) => {
        try {
            resolve(e)
        }
        catch (err) {
            reject(err)
        }

    })
    return link.then(url => {
        return {
            success: 1,
            file: {url}
        }
    })

}
export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true,
    },
    image: {
        class: Image,
        inlineToolbar: true,
        config: {
            uploadByFile: async (file) => {
                try {
                    const formData = new FormData();
                    formData.append("image", file);
                    formData.append("upload_preset", "blog_upload");

                    const res = await fetch("http://localhost:5000/upload", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await res.json();

                    if (!res.ok) throw new Error(data.error);

                    return {
                        success: 1,
                        file: {
                            url: data.url,
                        },
                    };
                } catch (err) {
                    console.error("Upload failed 🫠:", err);
                    return {
                        success: 0,
                    };
                }
            },
            uploadByUrl: uploadImagebyURL, // vẫn giữ nếu có chức năng paste URL
        }
    },

    header: {
        class: Header,
        inlineToolbar: true,
        config: {
            placeholder: 'Enter a header',
            levels: [2, 3, 4],
            defaultLevel: 2
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote\'s author'
        }
    },
    marker:
        Marker,
    inlineCode: InlineCode
}