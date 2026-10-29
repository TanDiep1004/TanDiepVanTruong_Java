import axios from 'axios';

// 1. Khởi tạo Trạm trung chuyển (Base URL)
const axiosCustom = axios.create({
    // Lấy link từ biến môi trường, nếu chưa tạo .env thì tạm dùng link localhost:8085/api
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// 2. Lính gác Đầu vào (Request Interceptor): Tự động gắn thẻ Token
axiosCustom.interceptors.request.use(
    (config) => {
        // Lệnh if này cực kỳ quan trọng trong Next.js để không bị lỗi "localStorage is not defined" khi render trên server
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Lính gác Đầu ra (Response Interceptor): Bóc tách dữ liệu và bắt lỗi
axiosCustom.interceptors.response.use(
    (response) => {
        // Tự động lột bỏ vỏ bọc của Axios, chỉ lấy cái "lõi" dữ liệu (response.data)
        return response && response.data ? response.data : response;
    },
    (error) => {
        // Nếu Back-end báo lỗi 401 (Chưa đăng nhập hoặc Token hết hạn)
        if (error.response && error.response.status === 401) {
            console.warn("Lỗi xác thực: Bắt buộc phải đăng nhập!");
            // Tự động "đá" người dùng về lại trang đăng nhập
            if (typeof window !== 'undefined') {
                 window.location.href = '/login'; 
            }
        }
        
        // Trả lỗi về cho trang giao diện xử lý (ví dụ: hiện Toast thông báo đỏ)
        return Promise.reject(error);
    }
);

export default axiosCustom;
