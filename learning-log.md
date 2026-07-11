# 蘊涵網站學習紀錄

## Day 1：網頁基礎與靜態網站

今日完成：
- 建立 yunhan-website 專案資料夾
- 建立 index.html
- 建立 style.css
- 完成蘊涵單頁網站雛形
- 加入導覽列
- 加入服務卡片
- 加入聯絡我們 CTA
- 加入 sticky 導覽列與 hover 效果

今日理解：
- HTML 負責內容結構
- CSS 負責視覺樣式
- class 可以讓 CSS 指定特定區塊
- id 可以讓導覽列跳到指定區塊
- 靜態網站可以先不需要伺服器，直接由瀏覽器讀取檔案

## Day 2：RWD、DevTools、檔案結構與基礎 JavaScript

今日完成：
- 使用 Chrome DevTools 測試不同螢幕寬度
- 理解 @media 與 RWD 斷點
- 使用 Inspect 查看元素與 CSS
- 建立 assets/css、assets/js、assets/images
- 將 style.css 移到 assets/css
- 建立 script.js
- 使用 console.log 確認 JS 載入
- 完成導覽列 click 偵測
- 完成 active 選單效果
- 理解 scroll spy 的基本邏輯

今日理解：
- RWD 是同一份 HTML 依照螢幕寬度套用不同 CSS
- DevTools 可以檢查元素、樣式與 Box Model
- JavaScript 可以透過 querySelectorAll 找到 HTML 元素
- addEventListener 可以監聽使用者行為
- classList 可以新增或移除 CSS class

## Day 3 ：本機伺服器與 localhost

今日完成：
- 使用 Terminal 進入 yunhan-website 資料夾
- 使用 python3 -m http.server 5500 啟動本機 Web Server
- 使用 http://localhost:5500 開啟網站
- 使用 DevTools Network 觀察 index.html、style.css、script.js 的載入
- 使用 Control + C 停止本機伺服器

今日理解：
- file:// 是瀏覽器直接讀取本機檔案
- http://localhost 是瀏覽器透過 HTTP 向本機伺服器請求檔案
- localhost 代表自己的電腦
- port 是服務對外等待連線的位置
- 200 代表檔案成功載入，404 代表找不到檔案
## Day 3：本機伺服器與 Network 面板

今日完成：
- 使用 python3 -m http.server 5500 啟動本機 Web Server
- 使用 http://localhost:5500 開啟網站
- 使用 Network 面板觀察 index.html、style.css、script.js、圖片請求
- 理解 200、304、404 的基本意義
- 故意改錯 CSS 路徑，觀察 404 與樣式失效
- 改回正確路徑，確認網站恢復正常

今日理解：
- file:// 是瀏覽器直接讀取本機檔案
- http://localhost 是瀏覽器透過 HTTP 向本機伺服器請求檔案
- HTML 是入口，CSS、JS、圖片會由瀏覽器另外請求
- Network 面板可以協助排查檔案是否成功載入
- 404 通常代表路徑錯誤或檔案不存在