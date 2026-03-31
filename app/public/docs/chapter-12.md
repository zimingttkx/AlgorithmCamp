# Chapter 12 · 字符串

> 来源：[灵茶山艾府题单](https://leetcode.cn/circle/discuss/SJFwQI/)

---

## 一、KMP（前缀的后缀）
KMP 原理讲解

定义 s 的真前缀为不等于 s 的前缀，s 的真后缀为不等于 s 的后缀。

定义 s 的 border 为既是 s 的真前缀又是 s 的真后缀的字符串。例如在 s=aabcaa 中，a 和 aa 都是 s 的 border。

对于模式串 p 的每个前缀 p[:i]，计算这个前缀的最长 border 长度，记在 π 数组中。

利用 π 数组，可以快速计算模式串 p 出现在文本串 t 的哪些位置上。

注：π 数组的定义参考《算法导论》，国内数据结构教材通常定义为 next 数组。以严蔚敏那本为例，二者的关系是 next[i+1]=π[i]+1，即 π 数组整体右移一位，元素值加一。

模板：

// 在文本串 text 中查找模式串 pattern，返回所有成功匹配的位置（pattern[0] 在 text 中的下标）
vector<int> kmp(const string& text, const string& pattern) {
    int m = pattern.size();
    vector<int> pi(m);
    int cnt = 0;
    for (int i = 1; i < m; i++) {
        char b = pattern[i];
        while (cnt && pattern[cnt] != b) {
            cnt = pi[cnt - 1];
        }
        if (pattern[cnt] == b) {
            cnt++;
        }
        pi[i] = cnt;
    }

    vector<int> pos;
    cnt = 0;
    for (int i = 0; i < text.size(); i++) {
        char b = text[i];
        while (cnt && pattern[cnt] != b) {
            cnt = pi[cnt - 1];
        }
        if (pattern[cnt] == b) {
            cnt++;
        }
        if (cnt == m) {
            pos.push_back(i - m + 1);
            cnt = pi[cnt - 1];
        }
    }
    return pos;
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 28 | [找出字符串中第一个匹配项的下标 模板题](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/) | — |
| 796 | [旋转字符串](https://leetcode.cn/problems/rotate-string/) | — |
| 1392 | [最长快乐前缀](https://leetcode.cn/problems/longest-happy-prefix/) | 1876 |
| 3036 | [匹配模式数组的子数组数目 II](https://leetcode.cn/problems/number-of-subarrays-that-match-a-pattern-ii/) | 1895 |
| 1764 | [通过连接另一个数组的子数组得到一个数组](https://leetcode.cn/problems/form-array-by-concatenating-subarrays-of-another-array/) | — |
| 1668 | [最大重复子字符串](https://leetcode.cn/problems/maximum-repeating-substring/) | — |
| 459 | [重复的子字符串](https://leetcode.cn/problems/repeated-substring-pattern/) | — |
| 2800 | [包含三个字符串的最短字符串](https://leetcode.cn/problems/shortest-string-that-contains-three-strings/) | — |
| 3008 | [找出数组中的美丽下标 II](https://leetcode.cn/problems/find-beautiful-indices-in-the-given-array-ii/) | 2016 |
| 214 | [最短回文串](https://leetcode.cn/problems/shortest-palindrome/) | — |
| 3529 | [统计水平子串和垂直子串重叠格子的数目](https://leetcode.cn/problems/count-cells-in-overlapping-horizontal-and-vertical-substrings/) | 2105 |
| 686 | [重复叠加字符串匹配](https://leetcode.cn/problems/repeated-string-match/) | 2200 |
| 3455 | [最短匹配子字符串](https://leetcode.cn/problems/shortest-matching-substring/) | 2303 |
| 1397 | [找到所有好字符串](https://leetcode.cn/problems/find-all-good-strings/) | 2667 |
| 3037 | [在无限流中寻找模式 II同 28 题 🔒](https://leetcode.cn/problems/find-pattern-in-infinite-stream-ii/) | — |
| 3571 | [最短超级串 II联系  题 🔒](https://leetcode.cn/problems/find-the-shortest-superstring-ii/) | 2800 |

## 二、Z 函数（后缀的前缀）
注：在国内算法竞赛圈，这个算法也叫扩展 KMP。

对于字符串 s，定义 z[i] 表示后缀 s[i:] 与 s 的 LCP（最长公共前缀）的长度，其中 s[i:] 表示从 s[i] 到 s[n−1] 的子串。

常用技巧是构造字符串 pattern+s，如果发现 z[m+i]≥m（m 是 pattern 的长度），则说明从 s[i] 开始的子串与 pattern 匹配。

所以上面的一些 KMP 题目（子串匹配相关的），也可以用 Z 函数解决。读者可以尝试用 Z 函数解决 28. 找出字符串中第一个匹配项的下标。

模板：

// 计算并返回 z 数组，其中 z[i] = |LCP(s[i:], s)|
vector<int> calc_z(const string& s) {
    int n = s.size();
    vector<int> z(n);
    int box_l = 0, box_r = 0;
    for (int i = 1; i < n; i++) {
        if (i <= box_r) {
            z[i] = min(z[i - box_l], box_r - i + 1);
        }
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
            box_l = i;
            box_r = i + z[i];
            z[i]++;
        }
    }
    z[0] = n;
    return z;
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2223 | [构造字符串的总得分和  模板题](https://leetcode.cn/problems/sum-of-scores-of-built-strings/) | 2220 |
| 3031 | [将单词恢复初始状态所需的最短时间 II](https://leetcode.cn/problems/minimum-time-to-revert-word-to-initial-state-ii/) | 2278 |
| 3045 | [统计前后缀下标对 II](https://leetcode.cn/problems/count-prefix-and-suffix-pairs-ii/) | 2328 |
| 3303 | [第一个几乎相等子字符串的下标](https://leetcode.cn/problems/find-the-occurrence-of-first-almost-equal-substring/) | 2509 |
| 3292 | [形成目标字符串需要的最少字符串数 II](https://leetcode.cn/problems/minimum-number-of-valid-strings-to-form-target-ii/) | 2662 |
| 3474 | [字典序最小的生成字符串](https://leetcode.cn/problems/lexicographically-smallest-generated-string/) | — |

LCP 数组

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2430 | [对字母串可执行的最大删除数](https://leetcode.cn/problems/maximum-deletions-on-a-string/) | 2102 |
| 3388 | [统计数组中的美丽分割](https://leetcode.cn/problems/count-beautiful-splits-in-an-array/) | 2365 |
| 1977 | [划分数字的方案数](https://leetcode.cn/problems/number-of-ways-to-separate-numbers/) | 2817 |

## 三、Manacher 算法（回文串）
Manacher 算法可以计算以 s[i]（或者 s[i] 和 s[i+1]）为回文中心的最长回文子串的长度。

此外，还可以：

判断任意子串是否为回文串。
计算从 s[i] 开始的最长回文子串的长度。
计算以 s[i] 结尾的最长回文子串的长度。
Z 函数和 Manacher 算法都会用到类似 Z-box 的概念，在学习时，可以对比体会。

模板代码

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 5 | [最长回文子串 模板题](https://leetcode.cn/problems/longest-palindromic-substring/) | — |
| 647 | [回文子串 计算回文子串个数](https://leetcode.cn/problems/palindromic-substrings/) | — |
| 214 | [最短回文串](https://leetcode.cn/problems/shortest-palindrome/) | — |
| 3327 | [判断 DFS 字符串是否是回文串](https://leetcode.cn/problems/check-if-dfs-strings-are-palindromes/) | 2454 |
| 1745 | [分割回文串 IV](https://leetcode.cn/problems/palindrome-partitioning-iv/) | — |
| 1960 | [两个回文子字符串长度的最大乘积](https://leetcode.cn/problems/maximum-product-of-the-length-of-two-palindromic-substrings/) | 2691 |
| 3844 | [最长的准回文子字符串](https://leetcode.cn/problems/longest-almost-palindromic-substring/) | — |
| 3504 | [子字符串连接后的最长回文串 II](https://leetcode.cn/problems/longest-palindrome-after-substring-concatenation-ii/) | — |

用到中心扩展法（及其思想）的算法题：

模板代码

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 5 | [最长回文子串 模板题](https://leetcode.cn/problems/longest-palindromic-substring/) | — |
| 3844 | [最长的准回文子字符串](https://leetcode.cn/problems/longest-almost-palindromic-substring/) | 1990 |
| 2472 | [不重叠回文子字符串的最大数目](https://leetcode.cn/problems/maximum-number-of-non-overlapping-palindrome-substrings/) | 2013 |
| 3504 | [子字符串连接后的最长回文串 II](https://leetcode.cn/problems/longest-palindrome-after-substring-concatenation-ii/) | 2398 |
| 3615 | [图中的最长回文路径](https://leetcode.cn/problems/longest-palindromic-path-in-graph/) | 2463 |
| 3579 | [字符串转换需要的最小操作数](https://leetcode.cn/problems/minimum-steps-to-convert-string-with-operations/) | — |

2
 )
## 四、字符串哈希
本题单的大多数题目都可以用字符串哈希解决。

推荐先把 2156. 查找给定哈希值的子串 和 3756. 连接非零数字并乘以其数字和 II 做了，对理解多项式哈希的计算方法有帮助。

模板代码见 我的题解，包含单模哈希和双模哈希。

小技巧：我们可以用字符串哈希比较两个子串的字典序大小。做法是二分长度，计算最长公共前缀（LCP），然后比较 LCP 的下一个字母（一定不同，或者不存在），即可判断两个子串谁大谁小。时间复杂度：O(logn)。见 3722 题。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 28 | [找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/) | — |
| 187 | [重复的 DNA 序列](https://leetcode.cn/problems/repeated-dna-sequences/) | — |
| 1316 | [不同的循环子字符串](https://leetcode.cn/problems/distinct-echo-substrings/) | 1837 |
| 1297 | [子串的最大出现次数](https://leetcode.cn/problems/maximum-number-of-occurrences-of-a-substring/) | — |
| 2261 | [含最多 K 个可整除元素的子数组](https://leetcode.cn/problems/k-divisible-elements-subarrays/) | — |

2
 )
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3722 | [反转后字典序最小的字符串](https://leetcode.cn/problems/lexicographically-smallest-string-after-reverse/) | — |
| 3213 | [最小代价构造字符串](https://leetcode.cn/problems/construct-string-with-minimum-cost/) | 2171 |
| 1367 | [二叉树中的链表](https://leetcode.cn/problems/linked-list-in-binary-tree/) | — |
| 1044 | [最长重复子串](https://leetcode.cn/problems/longest-duplicate-substring/) | 2429 |
| 718 | [最长重复子数组](https://leetcode.cn/problems/maximum-length-of-repeated-subarray/) | — |
| 1923 | [最长公共子路径](https://leetcode.cn/problems/longest-common-subpath/) | 2661 |
| 3292 | [形成目标字符串需要的最少字符串数 II](https://leetcode.cn/problems/minimum-number-of-valid-strings-to-form-target-ii/) | 2662 |
| 3844 | [最长的准回文子字符串](https://leetcode.cn/problems/longest-almost-palindromic-substring/) | — |
| 2168 | [每个数字的频率都相同的独特子字符串的数量同  题 🔒](https://leetcode.cn/problems/unique-substrings-with-equal-digit-frequency/) | 2261 |
| 1554 | [只有一个不同字符的字符串 🔒](https://leetcode.cn/problems/strings-differ-by-one-character/) | — |
| 1062 | [最长重复子串同  题 🔒](https://leetcode.cn/problems/longest-repeating-substring/) | 1044 |

## 五、最小表示法
定义循环左移操作：把字符串 s 的第一个字符 s[0] 移除，添加到 s 的末尾。例如 abcd 操作一次后得到 bcda。

问题：你可以执行任意次循环左移操作，计算你能得到的字典序最小的字符串。

注：任意次循环左移操作后，得到的字符串叫做 s 的循环同构串。

// 返回 s 的字典序最小的循环同构串
// 时间复杂度 O(n)，证明见代码末尾的注释
string smallestRepresentation(string s) {
    int n = s.size();
    s += s;
    // 注：如果要返回一个和原串不同的字符串，初始化 i=1, j=2
    int i = 0;
    for (int j = 1; j < n; ) {
        // 暴力比较：是 i 开头的字典序小，还是 j 开头的字典序小？
        // 相同就继续往后比，至多循环 n 次（如果循环 n 次，说明所有字母都相同，不用再比了）
        int k = 0;
        while (k < n && s[i + k] == s[j + k]) {
            k++;
        }
        if (k >= n) {
            break;
        }

        if (s[i + k] < s[j + k]) { // 注：如果求字典序最大，改成 >
            // 比如从 i 开始是 "aaab"，从 j 开始是 "aaac"
            // 从 i 开始比从 j 开始更小（排除 j）
            // 此外：
            // 从 i+1 开始比从 j+1 开始更小，所以从 j+1 开始不可能是答案，排除
            // 从 i+2 开始比从 j+2 开始更小，所以从 j+2 开始不可能是答案，排除
            // ……
            // 从 i+k 开始比从 j+k 开始更小，所以从 j+k 开始不可能是答案，排除
            // 所以下一个「可能是答案」的开始位置是 j+k+1
            j += k + 1;
        } else {
            // 从 j 开始比从 i 开始更小，更新 i=j（也意味着我们排除了 i）
            // 此外：
            // 从 j+1 开始比从 i+1 开始更小，所以从 i+1 开始不可能是答案，排除
            // 从 j+2 开始比从 i+2 开始更小，所以从 i+2 开始不可能是答案，排除
            // ……
            // 从 j+k 开始比从 i+k 开始更小，所以从 i+k 开始不可能是答案，排除
            // 所以把 j 跳到 i+k+1，不过这可能比 j+1 小，所以与 j+1 取 max
            // 综上所述，下一个「可能是答案」的开始位置是 max(j+1, i+k+1)
            int tmp = j;
            j = max(j, i + k) + 1;
            i = tmp;
        }

        // 每次要么排除 k+1 个与 i 相关的位置（这样的位置至多 n 个），要么排除 k+1 个与 j 相关的位置（这样的位置至多 n 个）
        // 所以上面关于 k 的循环，∑k <= 2n，所以二重循环的总循环次数是 O(n) 的
    }
    return s.substr(i, n);
}
推荐先完成 1163. 按字典序排在最后的子串，最小表示法是这题的环形版本。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 899 | [有序队列 k=1 的情况即为最小表示法，可以 O(n) 解决](https://leetcode.cn/problems/orderly-queue/) | — |
| 3403 | [从盒子中找出字典序最大的字符串 I](https://leetcode.cn/problems/find-the-lexicographically-largest-string-from-the-box-i/) | — |
| 1625 | [执行操作后字典序最小的字符串](https://leetcode.cn/problems/lexicographically-smallest-string-after-applying-operations/) | — |
| 3406 | [从盒子中找出字典序最大的字符串 II 🔒](https://leetcode.cn/problems/find-the-lexicographically-largest-string-from-the-box-ii/) | — |
| 1708 | [长度为 K 的最大子数组见进阶问题 🔒](https://leetcode.cn/problems/largest-subarray-length-k/) | — |

## 六、字典树
见 数据结构题单 第六章。
## 七、AC 自动机
AC 自动机 = 字典树 + KMP。

由于这些题目也可以用其他算法（字符串哈希等）解决，难度分仅供参考。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1032 | [字符流  模板题](https://leetcode.cn/problems/stream-of-characters/) | 1970 |
| 面试题 17.17 | [多次搜索 模板题](https://leetcode.cn/problems/面试题-17.17/) | — |
| 1408 | [数组中的字符串匹配](https://leetcode.cn/problems/string-matching-in-an-array/) | — |
| 3213 | [最小代价构造字符串](https://leetcode.cn/problems/construct-string-with-minimum-cost/) | 2171 |
| 2781 | [最长合法子字符串的长度](https://leetcode.cn/problems/length-of-the-longest-valid-substring/) | 2204 |
| 3292 | [形成目标字符串需要的最少字符串数 II](https://leetcode.cn/problems/minimum-number-of-valid-strings-to-form-target-ii/) | 2662 |
| 3758 | [将数字词转换为数字更通用的做法 🔒](https://leetcode.cn/problems/convert-number-words-to-digits/) | — |

## 八、后缀数组/后缀自动机
由于这些题目也可以用其他算法（字符串哈希等）解决，难度分仅供参考。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1163 | [按字典序排在最后的子串](https://leetcode.cn/problems/last-substring-in-lexicographical-order/) | 1864 |
| 1754 | [构造字典序最大的合并字符串](https://leetcode.cn/problems/largest-merge-of-two-strings/) | — |
| 2904 | [最短且字典序最小的美丽子字符串](https://leetcode.cn/problems/shortest-and-lexicographically-smallest-beautiful-string/) | — |
| 3722 | [反转后字典序最小的字符串](https://leetcode.cn/problems/lexicographically-smallest-string-after-reverse/) | — |
| 3213 | [最小代价构造字符串](https://leetcode.cn/problems/construct-string-with-minimum-cost/) | 2171 |
| 1044 | [最长重复子串](https://leetcode.cn/problems/longest-duplicate-substring/) | 2429 |
| 718 | [最长重复子数组](https://leetcode.cn/problems/maximum-length-of-repeated-subarray/) | — |
| 1923 | [最长公共子路径](https://leetcode.cn/problems/longest-common-subpath/) | 2661 |
| 1408 | [数组中的字符串匹配](https://leetcode.cn/problems/string-matching-in-an-array/) | — |
| 3729 | [统计有序数组中可被 K 整除的子数组数量](https://leetcode.cn/problems/count-distinct-subarrays-divisible-by-k-in-sorted-array/) | — |
| 3076 | [数组中的最短非公共子字符串](https://leetcode.cn/problems/shortest-uncommon-substring-in-an-array/) | — |
| 3844 | [最长的准回文子字符串](https://leetcode.cn/problems/longest-almost-palindromic-substring/) | — |
| 3504 | [子字符串连接后的最长回文串 II](https://leetcode.cn/problems/longest-palindrome-after-substring-concatenation-ii/) | — |
| 1316 | [不同的循环子字符串](https://leetcode.cn/problems/distinct-echo-substrings/) | — |
| 3388 | [统计数组中的美丽分割](https://leetcode.cn/problems/count-beautiful-splits-in-an-array/) | — |
| 2564 | [子字符串异或查询](https://leetcode.cn/problems/substring-xor-queries/) | — |
| 面试题 16.18 | [模式匹配 后缀树](https://leetcode.cn/problems/面试题-16.18/) | — |
| 1698 | [字符串的不同子字符串个数 🔒](https://leetcode.cn/problems/number-of-distinct-substrings-in-a-string/) | — |
| 1062 | [最长重复子串同  题 🔒](https://leetcode.cn/problems/longest-repeating-substring/) | 1044 |
| 3135 | [通过添加或删除结尾字符来同化字符串 🔒](https://leetcode.cn/problems/equalize-strings-by-adding-or-removing-characters-at-ends/) | — |

## 九、子序列自动机
上面都是和子串相关的算法，本节是和子序列相关的算法：子序列自动机。

虽然名字有些高大上，但实际上只是预处理 ≥i 的最近字母 c 的下标而已。

见 讲解 中的「进阶问题」。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 792 | [匹配子序列的单词数](https://leetcode.cn/problems/number-of-matching-subsequences/) | 1695 |
| 514 | [自由之路](https://leetcode.cn/problems/freedom-trail/) | 2400 |
| 2014 | [重复 K 次的最长子序列](https://leetcode.cn/problems/longest-subsequence-repeated-k-times/) | 2558 |
| 1055 | [形成字符串的最短路径 🔒](https://leetcode.cn/problems/shortest-way-to-form-string/) | — |
| 727 | [最小窗口子序列 🔒](https://leetcode.cn/problems/minimum-window-subsequence/) | — |

## 十、其他
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3485 | [删除元素后 K 个字符串的最长公共前缀  LCP 的性质](https://leetcode.cn/problems/longest-common-prefix-of-k-strings-after-removal/) | 2290 |
| 466 | [统计重复个数](https://leetcode.cn/problems/count-the-repetitions/) | — |

1
​
 ∣+∣s 
2
​
 ∣)
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3491 | [电话号码前缀非暴力做法 🔒](https://leetcode.cn/problems/phone-number-prefix/) | — |

关联题单
滑动窗口与双指针题单 中的「§4.2 判断子序列」。
数学题单 中的「§7.5 多项式」。
贪心题单 中的「三、字符串贪心」。
