import axios from 'axios';

const filterPaginationData = async ({ create_new_arr = false, state, arr, data, page, countRoute, data_to_send={} }) => {
    let obj;
    if (state !== null && !create_new_arr) {
        obj = { ...state, result: [...state.result, ...data], page: page };
    } else {
        try {
            const { data: { totalDocs } } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + countRoute, data_to_send);
            obj = { result: [...data], page: 1, totalDocs };
        } catch (err) {
            console.error("Lỗi fetch blog:", err);
        }
    }
    return obj;
};

export default filterPaginationData;
