#!/usr/bin/env python3
"""
LeetCode算法题单爬虫脚本
严格按照每10题一批进行爬取，避免内容截断
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
import os

# 配置12个题单信息
CHAPTERS = [
    {
        "id": "01",
        "title": "滑动窗口与双指针",
        "url": "https://leetcode.cn/discuss/post/3578981/ti-dan-hua-dong-chuang-kou-ding-chang-bu-rzz7/"
    },
    {
        "id": "02",
        "title": "二分算法",
        "url": "https://leetcode.cn/discuss/post/SqopEo/"
    },
    {
        "id": "03",
        "title": "单调栈",
        "url": "https://leetcode.cn/circle/discuss/9oZFK9/"
    },
    {
        "id": "04",
        "title": "网格图",
        "url": "https://leetcode.cn/discuss/post/3580195/fen-xiang-gun-ti-dan-wang-ge-tu-dfsbfszo-l3pa/"
    },
    {
        "id": "05",
        "title": "位运算",
        "url": "https://leetcode.cn/discuss/post/3580371/fen-xiang-gun-ti-dan-wei-yun-suan-ji-chu-nth4/"
    },
    {
        "id": "06",
        "title": "图论算法",
        "url": "https://leetcode.cn/discuss/post/3581143/fen-xiang-gun-ti-dan-tu-lun-suan-fa-dfsb-qyux/"
    },
    {
        "id": "07",
        "title": "动态规划",
        "url": "https://leetcode.cn/discuss/post/3581838/fen-xiang-gun-ti-dan-dong-tai-gui-hua-ru-007o/"
    },
    {
        "id": "08",
        "title": "常用数据结构",
        "url": "https://leetcode.cn/circle/discuss/mOr1u6/"
    },
    {
        "id": "09",
        "title": "数学算法",
        "url": "https://leetcode.cn/circle/discuss/IYT3ss/"
    },
    {
        "id": "10",
        "title": "贪心与思维",
        "url": "https://leetcode.cn/discuss/post/g6KTKL/"
    },
    {
        "id": "11",
        "title": "链表、二叉树与回溯",
        "url": "https://leetcode.cn/discuss/post/3142882/fen-xiang-gun-ti-dan-lian-biao-er-cha-sh-6srp/"
    },
    {
        "id": "12",
        "title": "字符串",
        "url": "https://leetcode.cn/discuss/post/3144832/fen-xiang-gun-ti-dan-zi-fu-chuan-kmpzhan-ugt4/"
    }
]

# HTTP请求头
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'https://leetcode.cn/',
    'Cookie': ''  # 如果需要登录，在这里添加cookie
}

def fetch_page(url, retry_times=3):
    """获取页面内容，支持重试"""
    for i in range(retry_times):
        try:
            response = requests.get(url, headers=HEADERS, timeout=30)
            if response.status_code == 200:
                return response.text
            else:
                print(f"请求失败，状态码: {response.status_code}, URL: {url}")
                time.sleep(2)
        except Exception as e:
            print(f"请求异常: {e}, URL: {url}")
            time.sleep(2)
    return None

def parse_html(html_content):
    """解析HTML内容，提取题目信息"""
    if not html_content:
        return None

    soup = BeautifulSoup(html_content, 'html.parser')

    # 提取页面主体内容
    content_div = soup.find('div', class_='discuss-content') or \
                  soup.find('div', class_='markdown-body') or \
                  soup.find('div', class_='post-content') or \
                  soup.find('article') or \
                  soup.find('div', {'id': 'post-content'})

    if not content_div:
        # 尝试从整个页面提取
        content_div = soup.find('body')

    return content_div

def extract_problems_from_html(content_div):
    """从HTML中提取题目列表"""
    problems = []

    if not content_div:
        return problems

    # 查找所有链接
    links = content_div.find_all('a')

    for link in links:
        href = link.get('href', '')
        text = link.get_text(strip=True)

        # 匹配LeetCode题目链接
        if 'leetcode.cn/problems/' in href:
            # 提取题目编号和名称
            match = re.search(r'(\d+)\.\s*(.+)', text)
            if match:
                problem_id = match.group(1)
                problem_title = match.group(2)

                # 揄取难度（可能在链接后面的文本中）
                difficulty = ''
                next_text = link.next_sibling
                if next_text:
                    diff_match = re.search(r'(简单|中等|困难|Easy|Medium|Hard)', str(next_text))
                    if diff_match:
                        difficulty = diff_match.group(1)

                problems.append({
                    'id': problem_id,
                    'title': problem_title,
                    'url': href if href.startswith('http') else f'https://leetcode.cn{href}',
                    'difficulty': difficulty
                })

    return problems

def save_to_json(data, filename):
    """保存数据到JSON文件"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"已保存: {filename}")

def scrape_chapter(chapter_info, batch_size=10):
    """爬取单个章节"""
    chapter_id = chapter_info['id']
    chapter_title = chapter_info['title']
    url = chapter_info['url']

    print(f"\n开始爬取第{chapter_id}号题单: {chapter_title}")
    print(f"URL: {url}")

    # 获取页面内容
    html_content = fetch_page(url)
    if not html_content:
        print(f"❌ 无法获取页面内容")
        return None

    # 解析HTML
    content_div = parse_html(html_content)

    # 提取题目列表
    all_problems = extract_problems_from_html(content_div)

    if not all_problems:
        print(f"❌ 未找到题目")
        return None

    print(f"✓ 共找到 {len(all_problems)} 道题目")

    # 分批保存（每batch_size题一批）
    total_problems = len(all_problems)
    batch_count = (total_problems // batch_size) + (1 if total_problems % batch_size > 0 else 0)

    # 保存分批数据
    for batch_idx in range(batch_count):
        start_idx = batch_idx * batch_size
        end_idx = min((batch_idx + 1) * batch_size, total_problems)
        batch_problems = all_problems[start_idx:end_idx]

        batch_filename = f'chapter-{chapter_id}-problems-part{batch_idx+1}.json'
        save_to_json({
            'chapter_id': chapter_id,
            'batch': batch_idx + 1,
            'range': f'{start_idx+1}-{end_idx}',
            'problems': batch_problems
        }, batch_filename)

        print(f"  批次 {batch_idx+1}: 题目 {start_idx+1}-{end_idx} ({len(batch_problems)}题)")

    # 合并生成完整JSON
    full_data = {
        'chapterId': chapter_id,
        'title': chapter_title,
        'url': url,
        'totalProblems': total_problems,
        'problems': all_problems
    }

    full_filename = f'chapter-{chapter_id}-full.json'
    save_to_json(full_data, full_filename)

    print(f"✓ 第{chapter_id}号题单爬取完成，共 {total_problems} 题")

    return full_data

def main():
    """主函数：逐个爬取所有题单"""
    print("=" * 60)
    print("LeetCode算法题单爬虫")
    print("严格按照每10题一批进行爬取")
    print("=" * 60)

    # 逐个处理题单
    for chapter_info in CHAPTERS:
        scrape_chapter(chapter_info, batch_size=10)
        time.sleep(1)  # 避免请求过快

    print("\n" + "=" * 60)
    print("所有题单爬取完成！")
    print("=" * 60)

if __name__ == '__main__':
    main()