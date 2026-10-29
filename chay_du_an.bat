@echo off
chcp 65001 >nul
echo ========================================================
echo     DỰ ÁN CỬA HÀNG MẮT KÍNH NTD EYEWEAR
echo ========================================================
echo.

echo [1/3] Đang kiểm tra XAMPP MySQL...
netstat -ano | findstr 3306 >nul
if %errorlevel% neq 0 (
    echo   - MySQL chưa chạy, đang khởi động MySQL qua XAMPP...
    start /b "" "c:\xampp\mysql\bin\mysqld.exe" --defaults-file="c:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 3 >nul
) else (
    echo   - MySQL đã sẵn sàng (Port 3306).
)

echo.
echo [2/3] Đang khởi động Backend Spring Boot (Port 8085)...
start "NTD Eyewear - Backend (Port 8085)" cmd /k "cd /d %~dp0backend && gradlew.bat bootRun"

echo.
echo [3/3] Đang khởi động Frontend Next.js (Port 3000)...
start "NTD Eyewear - Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Đang mở trình duyệt đến trang web...
timeout /t 5 >nul
start http://localhost:3000
echo.
echo Các đường dẫn:
echo   - Khách hàng (Store):  http://localhost:3000
echo   - Đăng nhập (Login):   http://localhost:3000/login
echo   - Quản trị (Admin):    http://localhost:3000/admin/dashboard
echo   - Backend API:         http://localhost:8085/api
echo ========================================================
