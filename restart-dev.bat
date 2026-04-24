@echo off
REM ════════════════════════════════════════════════════════
REM  3R Digital POD - Restart Dev Server (Clean Cache)
REM  ดับเบิ้ลคลิกไฟล์นี้เพื่อ restart dev server แบบล้าง cache
REM ════════════════════════════════════════════════════════

echo.
echo [1/3] กำลังลบ cache ของ Next.js...
if exist ".next" (
    rmdir /s /q .next
    echo      - ลบ .next เรียบร้อย
) else (
    echo      - ไม่มี .next folder อยู่แล้ว
)

echo.
echo [2/3] กำลังตรวจสอบ node_modules...
if not exist "node_modules" (
    echo      - ไม่มี node_modules, กำลังติดตั้ง...
    call npm install
) else (
    echo      - มี node_modules อยู่แล้ว
)

echo.
echo [3/3] เริ่มรัน dev server...
echo ════════════════════════════════════════
echo.
call npm run dev

pause
