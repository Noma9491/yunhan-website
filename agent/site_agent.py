import os
import subprocess
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from google import genai


BASE_DIR = Path("/home/shared/Yunhan")
AGENT_DIR = BASE_DIR / "agent"
REPORTS_DIR = AGENT_DIR / "reports"
CHECK_SCRIPT = AGENT_DIR / "site_check.sh"


def run_site_check() -> str:
    result = subprocess.run(
        [str(CHECK_SCRIPT)],
        cwd=str(AGENT_DIR),
        capture_output=True,
        text=True,
        timeout=60,
    )

    output = []
    output.append("STDOUT:")
    output.append(result.stdout)

    if result.stderr:
        output.append("\nSTDERR:")
        output.append(result.stderr)

    output.append(f"\nRETURN_CODE: {result.returncode}")
    return "\n".join(output)


def main():
    load_dotenv(AGENT_DIR / ".env")

    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing in agent/.env")

    if not model:
        raise RuntimeError("GEMINI_MODEL is missing in agent/.env")

    client = genai.Client(api_key=api_key)

    check_output = run_site_check()

    prompt = f"""
妳是蘊涵網站的發布檢查 AI Agent。

請根據以下檢查結果，產出繁體中文報告。

請包含：
1. Git 狀態是否乾淨
2. 是否看起來有敏感檔案被追蹤
3. GitHub Pages 公開網站是否正常
4. 裸網域與 www 網域是否正常
5. Ubuntu Nginx localhost 是否正常
6. DNS 是否看起來正確
7. 是否建議進行 git push 或 deploy.sh
8. 若有異常，列出下一步建議

重要限制：
- 不要要求自動 force push
- 不要要求自動刪檔
- 不要要求自動修改 DNS
- 不要要求自動執行 sudo
- 若資訊不足，請明確說明需要人工確認

檢查結果如下：

{check_output}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    report = response.text or "Gemini 沒有回傳文字內容，請檢查模型或 API 設定。"

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    report_path = REPORTS_DIR / f"site-agent-report-{timestamp}.md"

    report_path.write_text(report, encoding="utf-8")

    print(report)
    print(f"\nReport saved to: {report_path}")


if __name__ == "__main__":
    main()
