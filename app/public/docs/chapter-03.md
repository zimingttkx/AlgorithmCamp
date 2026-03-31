# Chapter 03 · 单调栈

> 来源：[灵茶山艾府题单](https://leetcode.cn/circle/discuss/9oZFK9/)

---

## 一、单调栈
### §1.1 基础
原理讲解：单调栈【基础算法精讲 26】

模板：

pair<vector<int>, vector<int>> nearestGreater(vector<int>& nums) {
    int n = nums.size();
    // left[i] 是 nums[i] 左侧最近的严格大于 nums[i] 的数的下标，若不存在则为 -1
    vector<int> left(n);
    vector<int> st{-1}; // 哨兵
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        while (st.size() > 1 && nums[st.back()] <= x) { // 如果求严格小于，改成 >=
            st.pop_back();
        }
        left[i] = st.back();
        st.push_back(i);
    }

    // right[i] 是 nums[i] 右侧最近的严格大于 nums[i] 的数的下标，若不存在则为 n
    vector<int> right(n);
    st = {n}; // 哨兵
    for (int i = n - 1; i >= 0; i--) {
        int x = nums[i];
        while (st.size() > 1 && nums[st.back()] <= x) { // 如果求严格小于，改成 >=
            st.pop_back();
        }
        right[i] = st.back();
        st.push_back(i);
    }

    return {left, right};
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 739 | [每日温度](https://leetcode.cn/problems/daily-temperatures/) | — |
| 1475 | [商品折扣后的最终价格](https://leetcode.cn/problems/final-prices-with-a-special-discount-in-a-shop/) | — |
| 496 | [下一个更大元素 I](https://leetcode.cn/problems/next-greater-element-i/) | — |
| 503 | [下一个更大元素 II](https://leetcode.cn/problems/next-greater-element-ii/) | — |
| 901 | [股票价格跨度](https://leetcode.cn/problems/online-stock-span/) | 1709 |
| 853 | [车队](https://leetcode.cn/problems/car-fleet/) | — |

### §1.2 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1019 | [链表中的下一个更大节点](https://leetcode.cn/problems/next-greater-node-in-linked-list/) | 1571 |
| 654 | [最大二叉树](https://leetcode.cn/problems/maximum-binary-tree/) | — |
| 768 | [最多能完成排序的块 II](https://leetcode.cn/problems/max-chunks-to-make-sorted-ii/) | 1788 |
| 3814 | [预算下的最大总容量](https://leetcode.cn/problems/maximum-capacity-within-budget/) | 1796 |
| 3676 | [碗子数组的数目](https://leetcode.cn/problems/count-bowl-subarrays/) | 1848 |
| 2054 | [两个最好的不重叠活动](https://leetcode.cn/problems/two-best-non-overlapping-events/) | 1883 |
| 456 | [132 模式](https://leetcode.cn/problems/132-pattern/) | 2000 |
| 3113 | [边界元素是最大值的子数组数目](https://leetcode.cn/problems/find-the-number-of-subarrays-where-boundary-elements-are-maximum/) | 2046 |
| 2866 | [美丽塔 II](https://leetcode.cn/problems/beautiful-towers-ii/) | 2072 |
| 975 | [奇偶跳](https://leetcode.cn/problems/odd-even-jump/) | 2079 |
| 1944 | [队列中可以看到的人数](https://leetcode.cn/problems/number-of-visible-people-in-a-queue/) | 2105 |
| 2454 | [下一个更大元素 IV](https://leetcode.cn/problems/next-greater-element-iv/) | 2175 |
| 1130 | [叶值的最小代价生成树 O(n) 做法](https://leetcode.cn/problems/minimum-cost-tree-from-leaf-values/) | — |
| 2289 | [使数组按非递减顺序排列](https://leetcode.cn/problems/steps-to-make-array-non-decreasing/) | 2482 |
| 1776 | [车队 II](https://leetcode.cn/problems/car-fleet-ii/) | 2531 |
| 2736 | [最大和查询](https://leetcode.cn/problems/maximum-sum-queries/) | 2533 |
| 3420 | [统计 K 次操作以内得到非递减子数组的数目  树形结构](https://leetcode.cn/problems/count-non-decreasing-subarrays-after-k-operations/) | 2855 |
| 3221 | [最大数组跳跃得分 II 🔒](https://leetcode.cn/problems/maximum-array-hopping-score-ii/) | — |
| 1966 | [未排序数组中的可被二分搜索的数 🔒](https://leetcode.cn/problems/binary-searchable-numbers-in-an-unsorted-array/) | — |
| 2832 | [每个元素为最大值的最大范围 🔒](https://leetcode.cn/problems/maximal-range-that-each-element-is-maximum-in-it/) | — |
| 1063 | [有效子数组的数目 🔒](https://leetcode.cn/problems/number-of-valid-subarrays/) | — |
| 1950 | [所有子数组最小值中的最大值 🔒](https://leetcode.cn/problems/maximum-of-minimum-values-in-all-subarrays/) | — |
| 2282 | [在一个网格中可以看到的人数 🔒](https://leetcode.cn/problems/number-of-people-that-can-be-seen-in-a-grid/) | — |
| 3555 | [排序每个滑动窗口中最小的子数组非暴力做法 🔒](https://leetcode.cn/problems/smallest-subarray-to-sort-in-every-sliding-window/) | — |
| 2355 | [你能拿走的最大图书数量 🔒](https://leetcode.cn/problems/maximum-number-of-books-you-can-take/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 962 | [最大宽度坡](https://leetcode.cn/problems/maximum-width-ramp/) | 1608 |
| 3542 | [将所有元素变为 0 的最少操作次数](https://leetcode.cn/problems/minimum-operations-to-convert-all-elements-to-zero/) | 1890 |
| 1124 | [表现良好的最长时间段](https://leetcode.cn/problems/longest-well-performing-interval/) | 1908 |
| 2863 | [最长半递减子数组的长度 🔒](https://leetcode.cn/problems/maximum-length-of-semi-decreasing-subarrays/) | — |

## 二、矩形
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 84 | [柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/) | — |
| 1793 | [好子数组的最大分数](https://leetcode.cn/problems/maximum-score-of-a-good-subarray/) | 1946 |
| 85 | [最大矩形](https://leetcode.cn/problems/maximal-rectangle/) | — |
| 221 | [最大正方形](https://leetcode.cn/problems/maximal-square/) | — |
| 42 | [接雨水 做法不止一种](https://leetcode.cn/problems/trapping-rain-water/) | — |
| 1504 | [统计全 1 子矩形](https://leetcode.cn/problems/count-submatrices-with-all-ones/) | — |
| 1277 | [统计全为 1 的正方形子矩阵](https://leetcode.cn/problems/count-square-submatrices-with-all-ones/) | — |
| 755 | [倒水 🔒](https://leetcode.cn/problems/pour-water/) | — |

## 三、贡献法
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 907 | [子数组的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums/) | 1976 |
| 2104 | [子数组范围和（最大值-最小值） O(n) 做法难度大约](https://leetcode.cn/problems/sum-of-subarray-ranges/) | 2000 |
| 1856 | [子数组最小乘积的最大值](https://leetcode.cn/problems/maximum-subarray-min-product/) | 2051 |
| 2818 | [操作使得分最大](https://leetcode.cn/problems/apply-operations-to-maximize-score/) | 2397 |
| 2281 | [巫师的总力量和（最小值×和）](https://leetcode.cn/problems/sum-of-total-strength-of-wizards/) | 2621 |
| 3430 | [最多 K 个元素的子数组的最值之和](https://leetcode.cn/problems/maximum-and-minimum-sums-of-at-most-size-k-subarrays/) | 2645 |
| 3359 | [查找最大元素不超过 K 的有序子矩阵矩形 🔒](https://leetcode.cn/problems/find-sorted-submatrices-with-maximum-element-at-most-k/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2334 | [元素值大于变化阈值的子数组](https://leetcode.cn/problems/subarray-with-elements-greater-than-varying-threshold/) | 2381 |
| 2962 | [统计最大元素出现至少 K 次的子数组·我的题解 中的思考题（解答见评论）](https://leetcode.cn/problems/count-subarrays-where-max-element-appears-at-least-k-times/) | — |

## 四、最小字典序
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 402 | [移掉 K 位数字](https://leetcode.cn/problems/remove-k-digits/) | 1800 |
| 1673 | [找出最具竞争力的子序列](https://leetcode.cn/problems/find-the-most-competitive-subsequence/) | 1802 |
| 316 | [去除重复字母](https://leetcode.cn/problems/remove-duplicate-letters/) | 2185 |

316 扩展：重复个数不超过 limit
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1081 | [不同字符的最小子序列](https://leetcode.cn/problems/smallest-subsequence-of-distinct-characters/) | — |
| 3816 | [删除重复字符后的字典序最小字符串](https://leetcode.cn/problems/lexicographically-smallest-string-after-deleting-duplicate-characters/) | 2377 |
| 321 | [拼接最大数](https://leetcode.cn/problems/create-maximum-number/) | — |
| 2030 | [含特定字母的最小子序列](https://leetcode.cn/problems/smallest-k-length-subsequence-with-occurrences-of-a-letter/) | 2562 |

关联题单
单调栈优化 DP：见 动态规划题单 中的「§11.2 单调栈优化 DP」。
单调队列：见 数据结构题单 中的「§4.3 单调队列」。

