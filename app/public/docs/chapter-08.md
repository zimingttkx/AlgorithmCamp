# Chapter 08 · 常用数据结构

> 来源：[灵茶山艾府题单](https://leetcode.cn/circle/discuss/mOr1u6/)

---

## 零、常用枚举技巧
### §0.1 枚举右，维护左
对于 双变量问题，例如两数之和 a 
i
​
 +a 
j
​
 =t，可以枚举右边的 a 
j
​
 ，转换成 单变量问题，也就是在 a 
j
​
  左边查找是否有 a 
i
​
 =t−a 
j
​
 ，这可以用哈希表维护。

我把这个技巧叫做 枚举右，维护左。

讲解

下面这些题目，如果可以，请用一次遍历实现。

### §0.1.1 基础
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1 | [两数之和](https://leetcode.cn/problems/two-sum/) | — |
| 1512 | [好数对的数目  相当于两数之差等于 0](https://leetcode.cn/problems/number-of-good-pairs/) | 1161 |
| 2441 | [与对应负数同时存在的最大正整数  相当于两数之和等于 0](https://leetcode.cn/problems/largest-positive-integer-that-exists-with-its-negative/) | 1168 |
| 121 | [买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/) | — |
| 2016 | [增量元素之间的最大差值](https://leetcode.cn/problems/maximum-difference-between-increasing-elements/) | 1246 |
| 624 | [数组列表中的最大距离](https://leetcode.cn/problems/maximum-distance-in-arrays/) | — |
| 2342 | [数位和相等数对的最大和](https://leetcode.cn/problems/max-sum-of-a-pair-with-equal-sum-of-digits/) | 1309 |
| 1128 | [等价多米诺骨牌对的数量](https://leetcode.cn/problems/number-of-equivalent-domino-pairs/) | 1333 |
| 1679 | [K 和数对的最大数目](https://leetcode.cn/problems/max-number-of-k-sum-pairs/) | 1346 |
| 面试题 16.24 | [数对和](https://leetcode.cn/problems/面试题-16.24/) | — |
| 219 | [存在重复元素 II](https://leetcode.cn/problems/contains-duplicate-ii/) | — |
| 2260 | [必须拿起的最小连续卡牌数](https://leetcode.cn/problems/minimum-consecutive-cards-to-pick-up/) | 1365 |
| 2001 | [可互换矩形的组数](https://leetcode.cn/problems/number-of-pairs-of-interchangeable-rectangles/) | 1436 |
| 2815 | [数组中的最大数对和](https://leetcode.cn/problems/max-pair-sum-in-an-array/) | — |
| 3623 | [统计梯形的数目 I](https://leetcode.cn/problems/count-number-of-trapezoids-i/) | 1580 |
| 2364 | [统计坏数对的数目](https://leetcode.cn/problems/count-number-of-bad-pairs/) | 1622 |
| 3805 | [统计凯撒加密对数目](https://leetcode.cn/problems/count-caesar-cipher-pairs/) | 1624 |
| 3371 | [识别数组中的最大异常值](https://leetcode.cn/problems/identify-the-largest-outlier-in-an-array/) | 1644 |
| 3761 | [镜像对之间最小绝对距离](https://leetcode.cn/problems/minimum-absolute-distance-between-mirror-pairs/) | 1669 |
| 1014 | [最佳观光组合](https://leetcode.cn/problems/best-sightseeing-pair/) | 1730 |
| 1814 | [统计一个数组中好对子的数目](https://leetcode.cn/problems/count-nice-pairs-in-an-array/) | 1738 |
| 3584 | [子序列首尾元素的最大乘积](https://leetcode.cn/problems/maximum-product-of-first-and-last-elements-of-a-subsequence/) | 1763 |
| 2905 | [找出满足差值条件的下标 II](https://leetcode.cn/problems/find-indices-with-index-and-value-difference-ii/) | 1764 |
| 3837 | [相等元素的延迟计数 🔒](https://leetcode.cn/problems/delayed-count-of-equal-elements/) | — |

### §0.1.2 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1010 | [总持续时间可被 60 整除的歌曲](https://leetcode.cn/problems/pairs-of-songs-with-total-durations-divisible-by-60/) | — |
| 3185 | [构成整天的下标对数目 II 同  题](https://leetcode.cn/problems/count-pairs-that-form-a-complete-day-ii/) | 1010 |
| 2748 | [美丽下标对的数目](https://leetcode.cn/problems/number-of-beautiful-pairs/) | — |
| 2506 | [统计相似字符串对的数目](https://leetcode.cn/problems/count-pairs-of-similar-strings/) | — |
| 2874 | [有序三元组中的最大值 II](https://leetcode.cn/problems/maximum-value-of-an-ordered-triplet-ii/) | 1583 |
| 1497 | [检查数组对是否可以被 k 整除](https://leetcode.cn/problems/check-if-array-pairs-are-divisible-by-k/) | 1787 |
| 1031 | [两个无重叠子数组的最大和](https://leetcode.cn/problems/maximum-sum-of-two-non-overlapping-subarrays/) | 2000 |
| 2555 | [两个线段获得的最多奖品](https://leetcode.cn/problems/maximize-win-from-two-segments/) | 2081 |
| 1995 | [统计特殊四元组 四个数](https://leetcode.cn/problems/count-special-quadruplets/) | — |
| 3404 | [统计特殊子序列的数目  四个数](https://leetcode.cn/problems/count-special-subsequences/) | 2445 |
| 3267 | [统计近似相等数对 II](https://leetcode.cn/problems/count-almost-equal-pairs-ii/) | 2545 |
| 3480 | [删除一个冲突对后最大子数组数目](https://leetcode.cn/problems/maximize-subarrays-after-removing-one-conflicting-pair/) | 2764 |
| 1214 | [查找两棵二叉搜索树之和 🔒](https://leetcode.cn/problems/two-sum-bsts/) | — |
| 2964 | [可被整除的三元组数量 🔒](https://leetcode.cn/problems/number-of-divisible-triplet-sums/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 454 | [四数相加 II](https://leetcode.cn/problems/4sum-ii/) | — |
| 220 | [存在重复元素 III](https://leetcode.cn/problems/contains-duplicate-iii/) | — |
| 3027 | [人员站位的方案数 II](https://leetcode.cn/problems/find-the-number-of-ways-to-place-people-ii/) | 2020 |
| 3548 | [等和矩阵分割 II  代码复用](https://leetcode.cn/problems/equal-sum-grid-partition-ii/) | 2245 |
| 3713 | [最长的平衡子串 I](https://leetcode.cn/problems/longest-balanced-substring-i/) | — |

### §0.2 枚举中间
对于有三个或者四个变量的问题，枚举中间的变量往往更好算。

为什么？比如问题有三个下标，需要满足 0≤i<j<k<n，对比一下：

枚举 i，后续计算中还需保证 j<k。
枚举 j，那么 i 和 k 自动被 j 隔开，互相独立，后续计算中无需关心 i 和 k 的位置关系。
所以枚举中间的变量更简单。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2909 | [元素和最小的山形三元组 II](https://leetcode.cn/problems/minimum-sum-of-mountain-triplets-ii/) | 1479 |
| 3583 | [统计特殊三元组  也可以一次遍历](https://leetcode.cn/problems/count-special-triplets/) | 1510 |
| 1930 | [长度为 3 的不同回文子序列](https://leetcode.cn/problems/unique-length-3-palindromic-subsequences/) | 1533 |
| 3128 | [直角三角形](https://leetcode.cn/problems/right-triangles/) | 1541 |
| 2874 | [有序三元组中的最大值 II  也可以一次遍历](https://leetcode.cn/problems/maximum-value-of-an-ordered-triplet-ii/) | 1583 |
| 447 | [回旋镖的数量](https://leetcode.cn/problems/number-of-boomerangs/) | — |
| 456 | [132 模式](https://leetcode.cn/problems/132-pattern/) | — |
| 3067 | [在带权树网络中统计可连接服务器对数目](https://leetcode.cn/problems/count-pairs-of-connectable-servers-in-a-weighted-tree-network/) | 1909 |
| 1534 | [统计好三元组](https://leetcode.cn/problems/count-good-triplets/) | — |

2
 )
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3455 | [最短匹配子字符串](https://leetcode.cn/problems/shortest-matching-substring/) | 2303 |
| 2242 | [节点序列的最大得分](https://leetcode.cn/problems/maximum-score-of-a-node-sequence/) | 2304 |
| 2867 | [统计树中的合法路径数目](https://leetcode.cn/problems/count-valid-paths-in-a-tree/) | 2428 |
| 2552 | [统计上升四元组  做法不止一种](https://leetcode.cn/problems/count-increasing-quadruplets/) | 2433 |
| 3257 | [放三个车的价值之和最大 II](https://leetcode.cn/problems/maximum-value-sum-by-placing-three-rooks-ii/) | 2553 |
| 3073 | [最大递增三元组 🔒](https://leetcode.cn/problems/maximum-increasing-triplet-value/) | — |

### §0.3 遍历对角线
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3446 | [按对角线进行矩阵排序](https://leetcode.cn/problems/sort-matrix-by-diagonals/) | 1373 |
| 2711 | [对角线上不同值的数量差](https://leetcode.cn/problems/difference-of-number-of-distinct-values-on-diagonals/) | 1429 |
| 1329 | [将矩阵按对角线排序](https://leetcode.cn/problems/sort-the-matrix-diagonally/) | 1548 |
| 498 | [对角线遍历](https://leetcode.cn/problems/diagonal-traverse/) | — |
| 面试题 17.23 | [最大黑方阵](https://leetcode.cn/problems/面试题-17.23/) | — |

2
 logn)，难度约 2800
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 562 | [矩阵中最长的连续1线段 🔒](https://leetcode.cn/problems/longest-line-of-consecutive-one-in-matrix/) | — |

注：有关前后缀分解的内容，见 动态规划题单 的「专题：前后缀分解」。

## 一、前缀和
### §1.1 基础
讲解

左闭右开公式：子数组 [left,right) 的元素和为 sum[right]−sum[left]。把下标区间定义成左闭右开，就不需要加一减一了。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 303 | [区域和检索 - 数组不可变 模板题](https://leetcode.cn/problems/range-sum-query-immutable/) | — |
| 3427 | [变长子数组求和](https://leetcode.cn/problems/sum-of-variable-length-subarrays/) | — |
| 2559 | [统计范围内的元音字符串数](https://leetcode.cn/problems/count-vowel-strings-in-ranges/) | 1435 |
| 1310 | [子数组异或查询](https://leetcode.cn/problems/xor-queries-of-a-subarray/) | 1460 |
| 3152 | [特殊数组 II](https://leetcode.cn/problems/special-array-ii/) | 1523 |
| 1749 | [任意子数组和的绝对值的最大值](https://leetcode.cn/problems/maximum-absolute-sum-of-any-subarray/) | 1542 |
| 53 | [最大子数组和](https://leetcode.cn/problems/maximum-subarray/) | — |
| 3652 | [按策略买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-using-strategy/) | 1557 |
| 3361 | [两个字符串的切换距离](https://leetcode.cn/problems/shift-distance-between-two-strings/) | — |
| 3511 | [构造正数组 🔒](https://leetcode.cn/problems/make-a-positive-array/) | — |
| 3540 | [访问所有房屋的最短时间 🔒](https://leetcode.cn/problems/minimum-time-to-visit-all-houses/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1523 | [在区间范围内统计奇数数目](https://leetcode.cn/problems/count-odd-numbers-in-an-interval-range/) | 1209 |
| 848 | [字母移位](https://leetcode.cn/problems/shifting-letters/) | 1353 |

### §1.2 前缀和与哈希表
通常要用到「枚举右，维护左」的技巧（见本题单 §0.1 节）。

讲解

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 560 | [和为 K 的子数组 我的题解包含变形题](https://leetcode.cn/problems/subarray-sum-equals-k/) | — |
| 930 | [和相同的二元子数组](https://leetcode.cn/problems/binary-subarrays-with-sum/) | 1592 |
| 1524 | [和为奇数的子数组数目](https://leetcode.cn/problems/number-of-sub-arrays-with-odd-sum/) | 1611 |
| 974 | [和可被 K 整除的子数组](https://leetcode.cn/problems/subarray-sums-divisible-by-k/) | 1676 |
| 523 | [连续的子数组和 类似 974 题](https://leetcode.cn/problems/continuous-subarray-sum/) | — |
| 2588 | [统计美丽子数组数目](https://leetcode.cn/problems/count-the-number-of-beautiful-subarrays/) | 1697 |
| 525 | [连续数组 0 和 1 个数相同的最长子数组](https://leetcode.cn/problems/contiguous-array/) | — |
| 面试题 17.05 | [字母与数字](https://leetcode.cn/problems/面试题-17.05/) | — |
| 3755 | [最大平衡异或子数组的长度 pair](https://leetcode.cn/problems/find-maximum-balanced-xor-subarray-length/) | — |
| 3026 | [最大好子数组和](https://leetcode.cn/problems/maximum-good-subarray-sum/) | 1817 |
| 1477 | [找两个和为目标值且不重叠的子数组](https://leetcode.cn/problems/find-two-non-overlapping-sub-arrays-each-with-target-sum/) | 1851 |
| 1546 | [和为目标值且不重叠的非空子数组的最大数目](https://leetcode.cn/problems/maximum-number-of-non-overlapping-subarrays-with-sum-equals-target/) | 1855 |
| 1124 | [表现良好的最长时间段](https://leetcode.cn/problems/longest-well-performing-interval/) | 1908 |
| 3728 | [边界与内部和相等的稳定子数组  pair 长度有下界](https://leetcode.cn/problems/stable-subarrays-with-equal-boundary-and-interior-sum/) | 1909 |
| 3381 | [长度可被 K 整除的子数组的最大元素和](https://leetcode.cn/problems/maximum-subarray-sum-with-length-divisible-by-k/) | 1943 |
| 2488 | [统计中位数为 K 的子数组](https://leetcode.cn/problems/count-subarrays-with-median-k/) | 1999 |
| 1590 | [使数组和能被 P 整除](https://leetcode.cn/problems/make-sum-divisible-by-p/) | 2039 |
| 2845 | [统计趣味子数组的数目](https://leetcode.cn/problems/count-of-interesting-subarrays/) | 2073 |
| 3739 | [统计主要元素子数组数目 II](https://leetcode.cn/problems/count-subarrays-with-majority-element-ii/) | 2090 |
| 1074 | [元素和为目标值的子矩阵数量  二维版本的 560 题](https://leetcode.cn/problems/number-of-submatrices-that-sum-to-target/) | 2189 |
| 1442 | [形成两个异或相等数组的三元组数目](https://leetcode.cn/problems/count-triplets-that-can-form-two-arrays-of-equal-xor/) | — |
| 3714 | [最长的平衡子串 II  pair](https://leetcode.cn/problems/longest-balanced-substring-ii/) | 2202 |
| 2025 | [分割数组的最多方案数](https://leetcode.cn/problems/maximum-number-of-ways-to-partition-an-array/) | 2218 |
| 3729 | [统计有序数组中可被 K 整除的子数组数量  子数组去重 / 避免重复统计](https://leetcode.cn/problems/count-distinct-subarrays-divisible-by-k-in-sorted-array/) | 2248 |
| 2949 | [统计美丽子字符串 II  pair](https://leetcode.cn/problems/count-beautiful-substrings-ii/) | 2445 |
| 325 | [和等于 k 的最长子数组长度 🔒](https://leetcode.cn/problems/maximum-size-subarray-sum-equals-k/) | — |
| 548 | [将数组分割成和相等的子数组 🔒](https://leetcode.cn/problems/split-array-with-equal-sum/) | — |
| 1983 | [范围和相等的最宽索引对 🔒](https://leetcode.cn/problems/widest-pair-of-indices-with-equal-range-sum/) | — |
| 2489 | [固定比率的子字符串数 🔒](https://leetcode.cn/problems/number-of-substrings-with-fixed-ratio/) | — |
| 2031 | [1 比 0 多的子数组个数做到 O(n) 🔒](https://leetcode.cn/problems/count-subarrays-with-more-ones-than-zeros/) | — |
| 2950 | [可整除子串的数量做到 O(kn)，其中 k=9。 🔒](https://leetcode.cn/problems/number-of-divisible-substrings/) | — |

前缀和与有序集合：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3364 | [最小正和子数组](https://leetcode.cn/problems/minimum-positive-sum-subarray/) | — |
| 363 | [矩形区域不超过 K 的最大数值和](https://leetcode.cn/problems/max-sum-of-rectangle-no-larger-than-k/) | — |
| 3739 | [统计主要元素子数组数目 II](https://leetcode.cn/problems/count-subarrays-with-majority-element-ii/) | 2090 |
| 2031 | [1 比 0 多的子数组个数有 O(n) 做法 🔒](https://leetcode.cn/problems/count-subarrays-with-more-ones-than-zeros/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 437 | [路径总和 III](https://leetcode.cn/problems/path-sum-iii/) | — |

### §1.3 距离和
图解

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1685 | [有序数组中差绝对值之和](https://leetcode.cn/problems/sum-of-absolute-differences-in-a-sorted-array/) | 1496 |
| 2615 | [等值距离和](https://leetcode.cn/problems/sum-of-distances/) | 1793 |
| 2602 | [使数组元素全部相等的最少操作次数](https://leetcode.cn/problems/minimum-operations-to-make-all-array-elements-equal/) | 1903 |
| 2968 | [执行操作使频率分数最大](https://leetcode.cn/problems/apply-operations-to-maximize-frequency-score/) | 2444 |
| 1703 | [得到连续 K 个 1 的最少相邻交换次数](https://leetcode.cn/problems/minimum-adjacent-swaps-for-k-consecutive-ones/) | 2467 |
| 3086 | [拾起 K 个 1 需要的最少行动次数](https://leetcode.cn/problems/minimum-moves-to-pick-k-ones/) | 2673 |
| 3422 | [将子数组元素变为相等所需的最小操作数 🔒](https://leetcode.cn/problems/minimum-operations-to-make-subarray-elements-equal/) | — |

### §1.4 状态压缩前缀和
推荐先阅读：从集合论到位运算，常见位运算技巧分类总结！

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1177 | [构建回文串检测](https://leetcode.cn/problems/can-make-palindrome-from-substring/) | 1848 |
| 1371 | [每个元音包含偶数次的最长子字符串](https://leetcode.cn/problems/find-the-longest-substring-containing-vowels-in-even-counts/) | 2041 |
| 1542 | [找出最长的超赞子字符串](https://leetcode.cn/problems/find-longest-awesome-substring/) | 2222 |
| 1915 | [最美子字符串的数目](https://leetcode.cn/problems/number-of-wonderful-substrings/) | 2235 |
| 2791 | [树中可以形成回文的路径数](https://leetcode.cn/problems/count-paths-that-can-form-a-palindrome-in-a-tree/) | 2677 |

### §1.5 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2389 | [和有限的最长子序列](https://leetcode.cn/problems/longest-subsequence-with-limited-sum/) | — |
| 3709 | [设计考试分数记录器](https://leetcode.cn/problems/design-exam-scores-tracker/) | 1648 |
| 1895 | [最大的幻方  斜向前缀和 可以优化到 O(N](https://leetcode.cn/problems/largest-magic-square/) | 1781 |

3
 )
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2055 | [蜡烛之间的盘子](https://leetcode.cn/problems/plates-between-candles/) | 1819 |
| 1744 | [你能在你最喜欢的那天吃到你最喜欢的糖果吗？](https://leetcode.cn/problems/can-you-eat-your-favorite-candy-on-your-favorite-day/) | 1859 |
| 1878 | [矩阵中最大的三个菱形和  斜向前缀和](https://leetcode.cn/problems/get-biggest-three-rhombus-sums-in-a-grid/) | 1898 |
| 3756 | [连接非零数字并乘以其数字和 II](https://leetcode.cn/problems/concatenate-non-zero-digits-and-multiply-by-sum-ii/) | 1968 |
| 1031 | [两个无重叠子数组的最大和](https://leetcode.cn/problems/maximum-sum-of-two-non-overlapping-subarrays/) | — |
| 2245 | [转角路径的乘积中最多能有几个尾随零](https://leetcode.cn/problems/maximum-trailing-zeros-in-a-cornered-path/) | 2037 |
| 1712 | [将数组分成三个子数组的方案数](https://leetcode.cn/problems/ways-to-split-array-into-three-subarrays/) | 2079 |
| 1862 | [向下取整数对和](https://leetcode.cn/problems/sum-of-floored-pairs/) | 2170 |
| 3748 | [统计稳定子数组的数目  包含进阶问题](https://leetcode.cn/problems/count-stable-subarrays/) | 2209 |
| 2281 | [巫师的总力量和](https://leetcode.cn/problems/sum-of-total-strength-of-wizards/) | 2621 |
| 3445 | [奇偶频次间的最大差值 II](https://leetcode.cn/problems/maximum-difference-between-even-and-odd-frequency-ii/) | 2694 |
| 2983 | [回文串重新排列查询](https://leetcode.cn/problems/palindrome-rearrangement-queries/) | 2780 |
| 2955 | [同端子串的数量 🔒](https://leetcode.cn/problems/number-of-same-end-substrings/) | — |
| 1788 | [最大化花园的美观度 🔒](https://leetcode.cn/problems/maximize-the-beauty-of-the-garden/) | — |
| 2819 | [购买巧克力后的最小相对损失 🔒](https://leetcode.cn/problems/minimum-relative-loss-after-buying-chocolates/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2300 | [咒语和药水的成功对数](https://leetcode.cn/problems/successful-pairs-of-spells-and-potions/) | — |
| 1534 | [统计好三元组](https://leetcode.cn/problems/count-good-triplets/) | — |

### §1.6 二维前缀和
【图解】一张图秒懂二维前缀和

模板：

class NumMatrix {
    vector<vector<int>> sum;

public:
    NumMatrix(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        sum.resize(m + 1, vector<int>(n + 1));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                sum[i + 1][j + 1] = sum[i + 1][j] + sum[i][j + 1] - sum[i][j] + matrix[i][j];
            }
        }
    }

    // 返回左上角在 (r1, c1)，右下角在 (r2, c2) 的子矩阵元素和
    int sumRegion(int r1, int c1, int r2, int c2) {
        return sum[r2 + 1][c2 + 1] - sum[r2 + 1][c1] - sum[r1][c2 + 1] + sum[r1][c1];
    }
};
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 304 | [二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable/) | — |
| 1314 | [矩阵区域和](https://leetcode.cn/problems/matrix-block-sum/) | 1484 |
| 3070 | [元素和小于等于 k 的子矩阵的数目](https://leetcode.cn/problems/count-submatrices-with-top-left-element-and-sum-less-than-k/) | 1499 |
| 1738 | [找出第 K 大的异或坐标值](https://leetcode.cn/problems/find-kth-largest-xor-coordinate-value/) | 1671 |
| 3212 | [统计 X 和 Y 频数相等的子矩阵数量](https://leetcode.cn/problems/count-submatrices-with-equal-frequency-of-x-and-y/) | 1673 |
| 1292 | [元素和小于等于阈值的正方形的最大边长  可以优化到 O(mn)](https://leetcode.cn/problems/maximum-side-length-of-a-square-with-sum-less-than-or-equal-to-threshold/) | 1735 |

二维前缀最小值：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3148 | [矩阵中的最大得分](https://leetcode.cn/problems/maximum-difference-score-in-a-grid/) | 1820 |

## 二、差分
### §2.1 一维差分
差分与前缀和的关系，类似导数与积分的关系。

数组 a 的差分的前缀和就是数组 a（不变）。

原理讲解

### §2.1.1 基础
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2848 | [与车相交的点](https://leetcode.cn/problems/points-that-intersect-with-cars/) | 1230 |
| 1893 | [检查是否区域内所有整数都被覆盖](https://leetcode.cn/problems/check-if-all-the-integers-in-a-range-are-covered/) | 1307 |
| 1854 | [人口最多的年份](https://leetcode.cn/problems/maximum-population-year/) | 1370 |
| 面试题 16.10 | [生存人数 同  题](https://leetcode.cn/problems/面试题-16.10/) | 1854 |
| 2960 | [统计已测试设备 差分思想](https://leetcode.cn/problems/count-tested-devices-after-test-operations/) | — |
| 1094 | [拼车](https://leetcode.cn/problems/car-pooling/) | 1441 |
| 1109 | [航班预订统计](https://leetcode.cn/problems/corporate-flight-bookings/) | 1570 |
| 3355 | [零数组变换 I](https://leetcode.cn/problems/zero-array-transformation-i/) | 1591 |
| 370 | [区间加法 🔒](https://leetcode.cn/problems/range-addition/) | — |

### §2.1.2 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3453 | [分割正方形 I](https://leetcode.cn/problems/separate-squares-i/) | 1735 |
| 2381 | [字母移位 II](https://leetcode.cn/problems/shifting-letters-ii/) | 1793 |
| 995 | [K 连续位的最小翻转次数](https://leetcode.cn/problems/minimum-number-of-k-consecutive-bit-flips/) | 1835 |
| 1589 | [所有排列中的最大和](https://leetcode.cn/problems/maximum-sum-obtained-of-any-permutation/) | 1871 |
| 1526 | [形成目标数组的子数组最少增加次数  差分思想](https://leetcode.cn/problems/minimum-number-of-increments-on-subarrays-to-form-a-target-array/) | 1872 |
| 3356 | [零数组变换 II  做法不止一种](https://leetcode.cn/problems/zero-array-transformation-ii/) | 1913 |
| 1943 | [描述绘画结果](https://leetcode.cn/problems/describe-the-painting/) | 1969 |
| 3224 | [使差值相等的最少数组改动次数  做法不止一种](https://leetcode.cn/problems/minimum-array-changes-to-make-differences-equal/) | 1996 |
| 2327 | [知道秘密的人数](https://leetcode.cn/problems/number-of-people-aware-of-a-secret/) | — |
| 2251 | [花期内花的数目](https://leetcode.cn/problems/number-of-flowers-in-full-bloom/) | 2022 |
| 2772 | [使数组中的所有元素都等于零](https://leetcode.cn/problems/apply-operations-to-make-all-array-elements-equal-to-zero/) | 2029 |
| 3229 | [使数组等于目标数组所需的最少操作次数  差分思想](https://leetcode.cn/problems/minimum-operations-to-make-array-equal-to-target/) | 2067 |
| 3529 | [统计水平子串和垂直子串重叠格子的数目](https://leetcode.cn/problems/count-cells-in-overlapping-horizontal-and-vertical-substrings/) | 2105 |
| 798 | [得分最高的最小轮调](https://leetcode.cn/problems/smallest-rotation-with-highest-score/) | 2130 |
| 3347 | [执行操作后元素的最高频率 II](https://leetcode.cn/problems/maximum-frequency-of-an-element-after-performing-operations-ii/) | 2156 |
| 2528 | [最大化城市的最小电量](https://leetcode.cn/problems/maximize-the-minimum-powered-city/) | 2236 |
| 1674 | [使数组互补的最少操作次数](https://leetcode.cn/problems/minimum-moves-to-make-array-complementary/) | 2333 |
| 3362 | [零数组变换 III](https://leetcode.cn/problems/zero-array-transformation-iii/) | 2424 |
| 3655 | [区间乘法查询后的异或 II  商分](https://leetcode.cn/problems/xor-after-range-multiplication-queries-ii/) | 2454 |
| 3017 | [按距离统计房屋对数目 II](https://leetcode.cn/problems/count-the-number-of-houses-at-a-certain-distance-ii/) | 2709 |
| 2021 | [街上最亮的位置 🔒](https://leetcode.cn/problems/brightest-position-on-street/) | — |
| 2015 | [每段建筑物的平均高度 🔒](https://leetcode.cn/problems/average-height-of-buildings-in-each-segment/) | — |
| 2237 | [计算街道上满足所需亮度的位置数量 🔒](https://leetcode.cn/problems/count-positions-on-street-with-required-brightness/) | — |
| 3009 | [折线图上的最大交点数量 🔒](https://leetcode.cn/problems/maximum-number-of-intersections-on-the-chart/) | — |
| 3279 | [活塞占据的最大总面积 🔒](https://leetcode.cn/problems/maximum-total-area-occupied-by-pistons/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 56 | [合并区间 做法见 我的评论](https://leetcode.cn/problems/merge-intervals/) | — |
| 57 | [插入区间](https://leetcode.cn/problems/insert-interval/) | — |
| 732 | [我的日程安排表 III](https://leetcode.cn/problems/my-calendar-iii/) | — |
| 2406 | [将区间分为最少组数](https://leetcode.cn/problems/divide-intervals-into-minimum-number-of-groups/) | 1713 |
| 253 | [会议室 II 🔒](https://leetcode.cn/problems/meeting-rooms-ii/) | — |
| 759 | [员工空闲时间 🔒](https://leetcode.cn/problems/employee-free-time/) | — |

### §2.2 二维差分
【图解】从一维差分到二维差分

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2536 | [子矩阵元素加 1](https://leetcode.cn/problems/increment-submatrices-by-one/) | 1583 |
| 850 | [矩形面积 II  暴力做法](https://leetcode.cn/problems/rectangle-area-ii/) | 2236 |
| 2132 | [用邮票贴满网格图](https://leetcode.cn/problems/stamping-the-grid/) | 2364 |
| LCP 74 | [最强祝福力场](https://leetcode.cn/problems/lcp-74/) | — |

## 三、栈
### §3.1 基础
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1441 | [用栈操作构建数组](https://leetcode.cn/problems/build-an-array-with-stack-operations/) | 1180 |
| 844 | [比较含退格的字符串](https://leetcode.cn/problems/backspace-string-compare/) | 1228 |
| 682 | [棒球比赛](https://leetcode.cn/problems/baseball-game/) | — |
| 2390 | [从字符串中移除星号](https://leetcode.cn/problems/removing-stars-from-a-string/) | 1348 |
| 1472 | [设计浏览器历史记录](https://leetcode.cn/problems/design-browser-history/) | 1454 |
| 946 | [验证栈序列](https://leetcode.cn/problems/validate-stack-sequences/) | 1462 |
| 3412 | [计算字符串的镜像分数](https://leetcode.cn/problems/find-mirror-score-of-a-string/) | 1578 |
| 71 | [简化路径](https://leetcode.cn/problems/simplify-path/) | — |

### §3.2 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3170 | [删除星号以后字典序最小的字符串](https://leetcode.cn/problems/lexicographically-minimum-string-after-removing-stars/) | 1772 |
| 155 | [最小栈](https://leetcode.cn/problems/min-stack/) | — |
| 1381 | [设计一个支持增量操作的栈](https://leetcode.cn/problems/design-a-stack-with-increment-operation/) | — |
| 636 | [函数的独占时间](https://leetcode.cn/problems/exclusive-time-of-functions/) | — |
| 2434 | [使用机器人打印字典序最小的字符串](https://leetcode.cn/problems/using-a-robot-to-print-the-lexicographically-smallest-string/) | 1953 |
| 895 | [最大频率栈](https://leetcode.cn/problems/maximum-frequency-stack/) | 2028 |
| 1172 | [餐盘栈](https://leetcode.cn/problems/dinner-plate-stacks/) | 2110 |
| 2589 | [完成所有任务的最少时间  做法不止一种](https://leetcode.cn/problems/minimum-time-to-complete-all-tasks/) | 2381 |
| 2524 | [子数组的最大频率分数 🔒](https://leetcode.cn/problems/maximum-frequency-score-of-a-subarray/) | — |
| 716 | [最大栈 🔒](https://leetcode.cn/problems/max-stack/) | — |

### §3.3 邻项消除
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2696 | [删除子串后的字符串最小长度](https://leetcode.cn/problems/minimum-string-length-after-removing-substrings/) | 1282 |
| 1047 | [删除字符串中的所有相邻重复项](https://leetcode.cn/problems/remove-all-adjacent-duplicates-in-string/) | 1286 |
| 1544 | [整理字符串](https://leetcode.cn/problems/make-the-string-great/) | 1344 |
| 3561 | [移除相邻字符](https://leetcode.cn/problems/resulting-string-after-adjacent-removals/) | 1397 |
| 1003 | [检查替换后的词是否有效](https://leetcode.cn/problems/check-if-word-is-valid-after-substitutions/) | 1427 |
| 3834 | [合并相邻且相等的元素](https://leetcode.cn/problems/merge-adjacent-equal-elements/) | 1429 |
| 2216 | [美化数组的最少删除数](https://leetcode.cn/problems/minimum-deletions-to-make-array-beautiful/) | 1510 |
| 1209 | [删除字符串中的所有相邻重复项 II](https://leetcode.cn/problems/remove-all-adjacent-duplicates-in-string-ii/) | 1542 |
| 3703 | [移除K-平衡子字符串](https://leetcode.cn/problems/remove-k-balanced-substrings/) | 1802 |
| 1717 | [删除子字符串的最大得分](https://leetcode.cn/problems/maximum-score-from-removing-substrings/) | 1868 |
| 2197 | [替换数组中的非互质数](https://leetcode.cn/problems/replace-non-coprime-numbers-in-array/) | 2057 |
| 735 | [小行星碰撞](https://leetcode.cn/problems/asteroid-collision/) | — |
| 2751 | [机器人碰撞](https://leetcode.cn/problems/robot-collisions/) | 2092 |

### §3.4 合法括号字符串（RBS）
注：部分题目可以不用栈，而是用一个数字记录嵌套深度。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 20 | [有效的括号](https://leetcode.cn/problems/valid-parentheses/) | — |
| 921 | [使括号有效的最少添加](https://leetcode.cn/problems/minimum-add-to-make-parentheses-valid/) | 1242 |
| 1021 | [删除最外层的括号](https://leetcode.cn/problems/remove-outermost-parentheses/) | 1311 |
| 1614 | [括号的最大嵌套深度](https://leetcode.cn/problems/maximum-nesting-depth-of-the-parentheses/) | 1323 |
| 1190 | [反转每对括号间的子串](https://leetcode.cn/problems/reverse-substrings-between-each-pair-of-parentheses/) | 1486 |
| 856 | [括号的分数](https://leetcode.cn/problems/score-of-parentheses/) | 1563 |
| 1249 | [移除无效的括号](https://leetcode.cn/problems/minimum-remove-to-make-valid-parentheses/) | 1657 |
| 1963 | [使字符串平衡的最小交换次数](https://leetcode.cn/problems/minimum-number-of-swaps-to-make-the-string-balanced/) | 1689 |
| 678 | [有效的括号字符串](https://leetcode.cn/problems/valid-parenthesis-string/) | 1700 |
| 1111 | [有效括号的嵌套深度](https://leetcode.cn/problems/maximum-nesting-depth-of-two-valid-parentheses-strings/) | 1749 |
| 1541 | [平衡括号字符串的最少插入次数](https://leetcode.cn/problems/minimum-insertions-to-balance-a-parentheses-string/) | 1759 |
| 2116 | [判断一个括号字符串是否有效  进阶问题：CF1709C](https://leetcode.cn/problems/check-if-a-parentheses-string-can-be-valid/) | 2038 |
| 32 | [最长有效括号](https://leetcode.cn/problems/longest-valid-parentheses/) | — |

### §3.5 表达式解析
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1006 | [笨阶乘  引入栈的思想](https://leetcode.cn/problems/clumsy-factorial/) | 1408 |
| 150 | [逆波兰表达式求值](https://leetcode.cn/problems/evaluate-reverse-polish-notation/) | — |
| 394 | [字符串解码](https://leetcode.cn/problems/decode-string/) | — |
| 8 | [字符串转换整数 (atoi) 为下面的题目热身](https://leetcode.cn/problems/string-to-integer-atoi/) | — |
| 224 | [基本计算器](https://leetcode.cn/problems/basic-calculator/) | — |
| 227 | [基本计算器 II](https://leetcode.cn/problems/basic-calculator-ii/) | — |
| 726 | [原子的数量](https://leetcode.cn/problems/number-of-atoms/) | — |
| 1106 | [解析布尔表达式](https://leetcode.cn/problems/parsing-a-boolean-expression/) | 1880 |
| 591 | [标签验证器](https://leetcode.cn/problems/tag-validator/) | — |
| 736 | [Lisp 语法解析](https://leetcode.cn/problems/parse-lisp-expression/) | — |
| 1096 | [花括号展开 II](https://leetcode.cn/problems/brace-expansion-ii/) | 2349 |
| 1896 | [反转表达式值的最少操作次数](https://leetcode.cn/problems/minimum-cost-to-change-the-final-value-of-expression/) | 2532 |
| 65 | [有效数字](https://leetcode.cn/problems/valid-number/) | — |
| 770 | [基本计算器 IV](https://leetcode.cn/problems/basic-calculator-iv/) | 2863 |
| 439 | [三元表达式解析器 🔒](https://leetcode.cn/problems/ternary-expression-parser/) | — |
| 3749 | [计算有效表达式 🔒](https://leetcode.cn/problems/evaluate-valid-expressions/) | — |
| 772 | [基本计算器 III 🔒](https://leetcode.cn/problems/basic-calculator-iii/) | — |
| 1087 | [花括号展开 🔒](https://leetcode.cn/problems/brace-expansion/) | — |
| 1597 | [根据中缀表达式构造二叉表达式树 🔒](https://leetcode.cn/problems/build-binary-expression-tree-from-infix-expression/) | — |
| 1628 | [设计带解析函数的表达式树 🔒](https://leetcode.cn/problems/design-an-expression-tree-with-evaluate-function/) | — |

### §3.6 对顶栈
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2296 | [设计一个文本编辑器](https://leetcode.cn/problems/design-a-text-editor/) | 1912 |

### §3.7 单调栈
见 单调栈题单。

## 四、队列
队列常用在 BFS 中，见 网格图题单 和 图论题单。与此相比，栈常用在 DFS 中，但无需我们手动维护。

### §4.1 基础
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 933 | [最近的请求次数](https://leetcode.cn/problems/number-of-recent-calls/) | 1338 |
| 3829 | [设计共享出行系统](https://leetcode.cn/problems/design-ride-sharing-system/) | 1594 |
| 950 | [按递增顺序显示卡牌](https://leetcode.cn/problems/reveal-cards-in-increasing-order/) | 1686 |
| 649 | [Dota2 参议院](https://leetcode.cn/problems/dota2-senate/) | — |
| 346 | [数据流中的移动平均值 🔒](https://leetcode.cn/problems/moving-average-from-data-stream/) | — |
| 362 | [敲击计数器 🔒](https://leetcode.cn/problems/design-hit-counter/) | — |
| 3851 | [不违反限制的最大请求数 🔒](https://leetcode.cn/problems/maximum-requests-without-violating-the-limit/) | — |
| 379 | [电话目录管理系统 🔒](https://leetcode.cn/problems/design-phone-directory/) | — |
| 1429 | [第一个唯一数字 🔒](https://leetcode.cn/problems/first-unique-number/) | — |
| 2534 | [通过门的时间 🔒](https://leetcode.cn/problems/time-taken-to-cross-the-door/) | — |

### §4.2 设计
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1670 | [设计前中后队列](https://leetcode.cn/problems/design-front-middle-back-queue/) | 1610 |
| 3508 | [设计路由器](https://leetcode.cn/problems/implement-router/) | 1851 |
| 225 | [用队列实现栈](https://leetcode.cn/problems/implement-stack-using-queues/) | — |
| 232 | [用栈实现队列](https://leetcode.cn/problems/implement-queue-using-stacks/) | — |
| 622 | [设计循环队列](https://leetcode.cn/problems/design-circular-queue/) | — |
| 641 | [设计循环双端队列](https://leetcode.cn/problems/design-circular-deque/) | — |

### §4.3 双端队列
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2810 | [故障键盘](https://leetcode.cn/problems/faulty-keyboard/) | — |
| 2071 | [你可以安排的最多任务数目](https://leetcode.cn/problems/maximum-number-of-tasks-you-can-assign/) | 2648 |

### §4.4 单调队列
个人觉得叫单调双端队列更准确。

单调队列 = 滑动窗口 + 单调栈。必须先掌握滑动窗口和单调栈这两个知识点，再学单调队列。

问：入队、出队、更新答案，这三步的顺序如何思考？

答：有两种情况。如果更新答案时，用到的数据包含当前元素，那么就需要先入队，再更新答案；如果用到的数据不包含当前元素，那么就需要先更新答案，再入队。至于出队，一般写在前面，每遍历到一个新的元素，就看看队首元素是否失效（不满足要求），失效则弹出队首。

原理讲解

模板：

// 计算 nums 的每个长为 k 的窗口的最大值
// 时间复杂度 O(n)，其中 n 是 nums 的长度
vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    int n = nums.size();
    vector<int> ans(n - k + 1); // 窗口个数
    deque<int> q; // 双端队列

    for (int i = 0; i < n; i++) {
        // 1. 右边入
        while (!q.empty() && nums[q.back()] <= nums[i]) {
            q.pop_back(); // 维护 q 的单调性
        }
        q.push_back(i); // 注意保存的是下标，这样下面可以判断队首是否离开窗口

        // 2. 左边出
        int left = i - k + 1; // 窗口左端点
        if (q.front() < left) { // 队首离开窗口
            q.pop_front();
        }

        // 3. 在窗口左端点处记录答案
        if (left >= 0) {
            // 由于队首到队尾单调递减，所以窗口最大值就在队首
            ans[left] = nums[q.front()];
        }
    }

    return ans;
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 239 | [滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/) | — |
| LCR 184 | [设计自助结算系统](https://leetcode.cn/problems/lcr-184/) | — |
| 1438 | [绝对差不超过限制的最长连续子数组](https://leetcode.cn/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/) | 1672 |
| 2762 | [不间断子数组 同  题](https://leetcode.cn/problems/continuous-subarrays/) | 1438 |
| 3835 | [开销小于等于 K 的子数组数目](https://leetcode.cn/problems/count-subarrays-with-cost-less-than-or-equal-to-k/) | 1759 |
| 2398 | [预算内的最多机器人数目](https://leetcode.cn/problems/maximum-number-of-robots-within-budget/) | 1917 |
| 3589 | [计数质数间隔平衡子数组](https://leetcode.cn/problems/count-prime-gap-balanced-subarrays/) | 2235 |
| 862 | [和至少为 K 的最短子数组](https://leetcode.cn/problems/shortest-subarray-with-sum-at-least-k/) | 2307 |
| 1499 | [满足不等式的最大值](https://leetcode.cn/problems/max-value-of-equation/) | 2456 |

关于单调队列优化 DP，见 动态规划题单 的「§11.3 单调队列优化 DP」。

## 五、堆（优先队列）
### §5.1 基础
为什么堆化的时间复杂度是 O(n)？

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1046 | [最后一块石头的重量](https://leetcode.cn/problems/last-stone-weight/) | 1173 |
| 3264 | [K 次乘运算后的最终数组 I](https://leetcode.cn/problems/final-array-state-after-k-multiplication-operations-i/) | 1178 |
| 2558 | [从数量最多的堆取走礼物](https://leetcode.cn/problems/take-gifts-from-the-richest-pile/) | 1277 |
| 2336 | [无限集中的最小数字](https://leetcode.cn/problems/smallest-number-in-infinite-set/) | 1375 |
| 2530 | [执行 K 次操作后的最大分数](https://leetcode.cn/problems/maximal-score-after-applying-k-operations/) | 1386 |
| 3066 | [超过阈值的最少操作数 II](https://leetcode.cn/problems/minimum-operations-to-exceed-threshold-value-ii/) | 1400 |
| 1962 | [移除石子使总数最小](https://leetcode.cn/problems/remove-stones-to-minimize-the-total/) | 1419 |
| 703 | [数据流中的第 K 大元素 经典题](https://leetcode.cn/problems/kth-largest-element-in-a-stream/) | — |
| 3275 | [第 K 近障碍物查询](https://leetcode.cn/problems/k-th-nearest-obstacle-queries/) | 1420 |
| 1845 | [座位预约管理系统  你能做到复杂度与 n 无关吗？](https://leetcode.cn/problems/seat-reservation-manager/) | 1429 |
| 2208 | [将数组和减半的最少操作次数](https://leetcode.cn/problems/minimum-operations-to-halve-array-sum/) | 1550 |
| 2233 | [K 次增加后的最大乘积](https://leetcode.cn/problems/maximum-product-after-k-increments/) | 1686 |
| 3296 | [移山所需的最少秒数](https://leetcode.cn/problems/minimum-number-of-seconds-to-make-mountain-height-zero/) | 1695 |
| 1942 | [最小未被占据椅子的编号](https://leetcode.cn/problems/the-number-of-the-smallest-unoccupied-chair/) | 1695 |
| 1801 | [积压订单中的订单总数](https://leetcode.cn/problems/number-of-orders-in-the-backlog/) | 1711 |
| 2406 | [将区间分为最少组数  经典题](https://leetcode.cn/problems/divide-intervals-into-minimum-number-of-groups/) | 1713 |
| 3478 | [选出和最大的 K 个元素](https://leetcode.cn/problems/choose-k-elements-with-maximum-sum/) | 1753 |
| 2462 | [雇佣 K 位工人的总代价](https://leetcode.cn/problems/total-cost-to-hire-k-workers/) | 1764 |
| 1834 | [单线程 CPU](https://leetcode.cn/problems/single-threaded-cpu/) | 1798 |
| 1792 | [最大平均通过率](https://leetcode.cn/problems/maximum-average-pass-ratio/) | 1818 |
| 1167 | [连接木棍的最低费用 🔒](https://leetcode.cn/problems/minimum-cost-to-connect-sticks/) | — |
| 253 | [会议室 II经典题 🔒](https://leetcode.cn/problems/meeting-rooms-ii/) | — |

### §5.2 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 23 | [合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/) | — |
| 2931 | [购买物品的最大开销](https://leetcode.cn/problems/maximum-spending-after-buying-items/) | 1822 |
| 3781 | [二进制交换后的最大分数  两种方法](https://leetcode.cn/problems/maximum-score-after-binary-swaps/) | 1823 |
| 502 | [IPO](https://leetcode.cn/problems/ipo/) | — |
| 1705 | [吃苹果的最大数目](https://leetcode.cn/problems/maximum-number-of-eaten-apples/) | 1930 |
| 778 | [水位上升的泳池中游泳](https://leetcode.cn/problems/swim-in-rising-water/) | — |
| 1631 | [最小体力消耗路径](https://leetcode.cn/problems/path-with-minimum-effort/) | 1948 |
| 1882 | [使用服务器处理任务](https://leetcode.cn/problems/process-tasks-using-servers/) | 1979 |
| 1354 | [多次求和构造目标数组](https://leetcode.cn/problems/construct-target-array-with-multiple-sums/) | 2015 |
| 1353 | [最多可以参加的会议数目](https://leetcode.cn/problems/maximum-number-of-events-that-can-be-attended/) | 2016 |
| 1235 | [规划兼职工作  做法不止一种](https://leetcode.cn/problems/maximum-profit-in-job-scheduling/) | 2023 |
| 632 | [最小区间 做法不止一种](https://leetcode.cn/problems/smallest-range-covering-elements-from-k-lists/) | — |
| 2542 | [最大子序列的分数](https://leetcode.cn/problems/maximum-subsequence-score/) | 2056 |
| 1383 | [最大的团队表现值](https://leetcode.cn/problems/maximum-performance-of-a-team/) | 2091 |
| 2402 | [会议室 III](https://leetcode.cn/problems/meeting-rooms-iii/) | 2093 |
| 2503 | [矩阵查询可获得的最大分数](https://leetcode.cn/problems/maximum-number-of-points-from-grid-queries/) | 2196 |
| 2163 | [删除元素后和的最小差值](https://leetcode.cn/problems/minimum-difference-in-sums-after-removal-of-elements/) | 2225 |
| 857 | [雇佣 K 名工人的最低成本](https://leetcode.cn/problems/minimum-cost-to-hire-k-workers/) | 2260 |
| 1606 | [找到处理最多请求的服务器](https://leetcode.cn/problems/find-servers-that-handled-most-number-of-requests/) | 2276 |
| 1851 | [包含每个查询的最小区间](https://leetcode.cn/problems/minimum-interval-to-include-each-query/) | 2286 |
| 407 | [接雨水 II](https://leetcode.cn/problems/trapping-rain-water-ii/) | — |
| 2940 | [找到 Alice 和 Bob 可以相遇的建筑](https://leetcode.cn/problems/find-building-where-alice-and-bob-can-meet/) | 2327 |
| 3399 | [字符相同的最短子字符串 II](https://leetcode.cn/problems/smallest-substring-with-identical-characters-ii/) | 2376 |
| 2589 | [完成所有任务的最少时间  做法不止一种](https://leetcode.cn/problems/minimum-time-to-complete-all-tasks/) | 2381 |
| 3266 | [K 次乘运算后的最终数组 II](https://leetcode.cn/problems/final-array-state-after-k-multiplication-operations-ii/) | 2509 |
| 1675 | [数组的最小偏移量](https://leetcode.cn/problems/minimize-deviation-in-array/) | 2533 |
| 2617 | [网格图中最少访问的格子数](https://leetcode.cn/problems/minimum-number-of-visited-cells-in-a-grid/) | 2582 |
| 2532 | [过桥的时间](https://leetcode.cn/problems/time-to-cross-a-bridge/) | 2589 |
| LCP 33 | [蓄水 思考：更快的做法](https://leetcode.cn/problems/lcp-33/) | — |
| 1500 | [设计文件分享系统 🔒](https://leetcode.cn/problems/design-a-file-sharing-system/) | — |
| 1199 | [建造街区的最短时间 🔒](https://leetcode.cn/problems/minimum-time-to-build-blocks/) | — |
| 3506 | [查找消除细菌菌株所需时间 🔒](https://leetcode.cn/problems/find-time-required-to-eliminate-bacterial-strains/) | — |

有序集合：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1348 | [推文计数](https://leetcode.cn/problems/tweet-counts-per-frequency/) | 2037 |
| 855 | [考场就座](https://leetcode.cn/problems/exam-room/) | 2067 |
| 1912 | [设计电影租借系统](https://leetcode.cn/problems/design-movie-rental-system/) | 2182 |

### §5.3 第 K 小/大
部分题目也可以用二分解决。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 264 | [丑数 II](https://leetcode.cn/problems/ugly-number-ii/) | — |
| 378 | [有序矩阵中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-sorted-matrix/) | — |
| 23 | [合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/) | — |
| 373 | [查找和最小的 K 对数字](https://leetcode.cn/problems/find-k-pairs-with-smallest-sums/) | — |
| 1439 | [有序矩阵中的第 k 个最小数组和](https://leetcode.cn/problems/find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows/) | 2134 |
| 786 | [第 K 个最小的质数分数](https://leetcode.cn/problems/k-th-smallest-prime-fraction/) | 2169 |
| 3691 | [最大子数组总值 II](https://leetcode.cn/problems/maximum-total-subarray-value-ii/) | 2469 |
| 2386 | [找出数组的第 K 大和](https://leetcode.cn/problems/find-the-k-sum-of-an-array/) | 2648 |

### §5.4 重排元素
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 984 | [不含 AAA 或 BBB 的字符串  不需要堆，这题的目的是引入贪心思想](https://leetcode.cn/problems/string-without-aaa-or-bbb/) | 1474 |
| 767 | [重构字符串](https://leetcode.cn/problems/reorganize-string/) | 1681 |
| 1054 | [距离相等的条形码](https://leetcode.cn/problems/distant-barcodes/) | 1702 |
| 1405 | [最长快乐字符串](https://leetcode.cn/problems/longest-happy-string/) | 1821 |
| 3081 | [替换字符串中的问号使分数最小](https://leetcode.cn/problems/replace-question-marks-in-string-to-minimize-its-value/) | 1905 |
| 621 | [任务调度器](https://leetcode.cn/problems/task-scheduler/) | — |
| 358 | [K 距离间隔重排字符串 🔒](https://leetcode.cn/problems/rearrange-string-k-distance-apart/) | — |

### §5.5 反悔堆
基于堆的反悔贪心。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| LCP 30 | [魔塔游戏](https://leetcode.cn/problems/lcp-30/) | — |
| 1642 | [可以到达的最远建筑](https://leetcode.cn/problems/furthest-building-you-can-reach/) | 1962 |
| 630 | [课程表 III](https://leetcode.cn/problems/course-schedule-iii/) | — |
| 871 | [最低加油次数](https://leetcode.cn/problems/minimum-number-of-refueling-stops/) | 2074 |
| 3362 | [零数组变换 III  虽然没有反悔的过程，但思路和 871 是类似的](https://leetcode.cn/problems/zero-array-transformation-iii/) | 2424 |
| 2813 | [子序列最大优雅度  也可以不用堆](https://leetcode.cn/problems/maximum-elegance-of-a-k-length-subsequence/) | 2582 |
| 3049 | [标记所有下标的最早秒数 II](https://leetcode.cn/problems/earliest-second-to-mark-indices-ii/) | 3111 |
| 3711 | [不出现负余额的最大交易额 🔒](https://leetcode.cn/problems/maximum-transactions-without-negative-balance/) | — |
| 2599 | [使前缀和数组非负 🔒](https://leetcode.cn/problems/make-the-prefix-sum-non-negative/) | — |

### §5.6 懒删除堆
支持删除堆中任意元素。

模板：

// 模板来源 https://leetcode.cn/circle/discuss/mOr1u6/
// 最大堆 LazyHeap<int> max_pq;
// 最小堆 LazyHeap<int, greater<>> min_pq;
template<typename T, typename Compare = less<T>>
class LazyHeap {
    priority_queue<T, vector<T>, Compare> pq;
    unordered_map<T, int> remove_cnt; // 每个元素剩余需要删除的次数
    size_t sz = 0; // 堆的实际大小

    // 正式执行删除操作
    void apply_remove() {
        while (!pq.empty() && remove_cnt[pq.top()] > 0) {
            remove_cnt[pq.top()]--;
            pq.pop();
        }
    }

public:
    // 删除堆中所有应该删除的元素后，堆的实际大小
    size_t size() {
        return sz;
    }

    // 删除
    void remove(T x) {
        remove_cnt[x]++; // 懒删除
        sz--;
    }

    // 查看堆顶
    T top() {
        apply_remove();
        return pq.top(); // 真正的堆顶
    }

    // 出堆
    T pop() {
        apply_remove();
        sz--;
        T x = pq.top();
        pq.pop();
        return x;
    }

    // 入堆
    void push(T x) {
        if (remove_cnt[x] > 0) {
            remove_cnt[x]--; // 抵消之前的删除
        } else {
            pq.push(x);
        }
        sz++;
    }
};
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2349 | [设计数字容器系统](https://leetcode.cn/problems/design-a-number-container-system/) | 1540 |
| 3607 | [电网维护](https://leetcode.cn/problems/power-grid-maintenance/) | 1700 |
| 2353 | [设计食物评分系统](https://leetcode.cn/problems/design-a-food-rating-system/) | 1782 |
| 3092 | [最高频率的 ID](https://leetcode.cn/problems/most-frequent-ids/) | 1793 |
| 3408 | [设计任务管理器](https://leetcode.cn/problems/design-task-manager/) | 1807 |
| 2034 | [股票价格波动](https://leetcode.cn/problems/stock-price-fluctuation/) | 1832 |
| 3815 | [设计拍卖系统](https://leetcode.cn/problems/design-auction-system/) | 1854 |
| 1172 | [餐盘栈](https://leetcode.cn/problems/dinner-plate-stacks/) | 2110 |
| 218 | [天际线问题 扫描线](https://leetcode.cn/problems/the-skyline-problem/) | — |
| 3510 | [移除最小数对使数组有序 II](https://leetcode.cn/problems/minimum-pair-removal-to-sort-array-ii/) | 2608 |
| 3672 | [子数组中加权众数的总和 🔒](https://leetcode.cn/problems/sum-of-weighted-modes-in-subarrays/) | — |
| 3391 | [设计一个高效的层跟踪三维二进制矩阵 🔒](https://leetcode.cn/problems/design-a-3d-binary-matrix-with-efficient-layer-tracking/) | — |
| 716 | [最大栈 🔒](https://leetcode.cn/problems/max-stack/) | — |

### §5.7 对顶堆（滑动窗口第 K 小/大）
讲解

部分题目需要结合懒删除堆。

做法不止一种，部分题目也可以用有序集合/权值树状数组等数据结构解决。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2102 | [序列顺序查询](https://leetcode.cn/problems/sequentially-ordinal-rank-tracker/) | 2159 |
| 295 | [数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/) | — |
| 480 | [滑动窗口中位数](https://leetcode.cn/problems/sliding-window-median/) | — |
| 2653 | [滑动子数组的美丽值](https://leetcode.cn/problems/sliding-subarray-beauty/) | — |
| 1825 | [求出 MK 平均值](https://leetcode.cn/problems/finding-mk-average/) | 2396 |
| 3505 | [使 K 个子数组内元素相等的最少操作数  滑动窗口中位数的距离和](https://leetcode.cn/problems/minimum-operations-to-make-elements-within-k-subarrays-equal/) | 2539 |
| 3013 | [将数组分成最小总代价的子数组 II](https://leetcode.cn/problems/divide-an-array-into-subarrays-with-minimum-cost-ii/) | 2540 |
| 3321 | [计算子数组的 x-sum II](https://leetcode.cn/problems/find-x-sum-of-all-k-long-subarrays-ii/) | 2598 |
| LCP 24 | [数字游戏](https://leetcode.cn/problems/lcp-24/) | — |
| 3369 | [设计数组统计跟踪器 🔒](https://leetcode.cn/problems/design-an-array-statistics-tracker/) | — |
| 3422 | [将子数组元素变为相等所需的最小操作数 🔒](https://leetcode.cn/problems/minimum-operations-to-make-subarray-elements-equal/) | — |

另见 图论题单 中的 Dijkstra 算法。

## 六、字典树（trie）
### §6.1 基础
模板

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 208 | [实现 Trie (前缀树)](https://leetcode.cn/problems/implement-trie-prefix-tree/) | — |
| 3597 | [分割字符串](https://leetcode.cn/problems/partition-string/) | — |
| 648 | [单词替换](https://leetcode.cn/problems/replace-words/) | — |
| 720 | [词典中最长的单词](https://leetcode.cn/problems/longest-word-in-dictionary/) | — |
| 2416 | [字符串的前缀分数和](https://leetcode.cn/problems/sum-of-prefix-scores-of-strings/) | 1725 |
| 677 | [键值映射](https://leetcode.cn/problems/map-sum-pairs/) | — |
| 1268 | [搜索推荐系统](https://leetcode.cn/problems/search-suggestions-system/) | — |
| 1233 | [删除子文件夹](https://leetcode.cn/problems/remove-sub-folders-from-the-filesystem/) | — |
| 820 | [单词的压缩编码](https://leetcode.cn/problems/short-encoding-of-words/) | — |
| 2261 | [含最多 K 个可整除元素的子数组](https://leetcode.cn/problems/k-divisible-elements-subarrays/) | — |

2
 )
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1804 | [实现 Trie （前缀树） II 🔒](https://leetcode.cn/problems/implement-trie-ii-prefix-tree/) | — |
| 2168 | [每个数字的频率都相同的独特子字符串的数量同  题 🔒](https://leetcode.cn/problems/unique-substrings-with-equal-digit-frequency/) | 2261 |

### §6.2 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 211 | [添加与搜索单词 - 数据结构设计](https://leetcode.cn/problems/design-add-and-search-words-data-structure/) | — |
| 676 | [实现一个魔法字典](https://leetcode.cn/problems/implement-magic-dictionary/) | — |
| 212 | [单词搜索 II](https://leetcode.cn/problems/word-search-ii/) | — |
| 3093 | [最长公共后缀查询](https://leetcode.cn/problems/longest-common-suffix-queries/) | 2118 |
| 745 | [前缀和后缀搜索](https://leetcode.cn/problems/prefix-and-suffix-search/) | — |
| 3045 | [统计前后缀下标对 II](https://leetcode.cn/problems/count-prefix-and-suffix-pairs-ii/) | 2328 |
| 336 | [回文对](https://leetcode.cn/problems/palindrome-pairs/) | — |
| 1948 | [删除系统中的重复文件夹](https://leetcode.cn/problems/delete-duplicate-folders-in-system/) | 2534 |
| 425 | [单词方块 🔒](https://leetcode.cn/problems/word-squares/) | — |
| 527 | [单词缩写 🔒](https://leetcode.cn/problems/word-abbreviation/) | — |
| 588 | [设计内存文件系统 🔒](https://leetcode.cn/problems/design-in-memory-file-system/) | — |
| 616 | [给字符串添加加粗标签 🔒](https://leetcode.cn/problems/add-bold-tag-in-string/) | — |
| 758 | [字符串中的加粗单词 🔒](https://leetcode.cn/problems/bold-words-in-string/) | — |
| 642 | [设计搜索自动补全系统 🔒](https://leetcode.cn/problems/design-search-autocomplete-system/) | — |
| 1065 | [字符串的索引对 🔒](https://leetcode.cn/problems/index-pairs-of-a-string/) | — |
| 1166 | [设计文件系统 🔒](https://leetcode.cn/problems/design-file-system/) | — |
| 1858 | [包含所有前缀的最长单词 🔒](https://leetcode.cn/problems/longest-word-with-all-prefixes/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 440 | [字典序的第K小数字](https://leetcode.cn/problems/k-th-smallest-in-lexicographical-order/) | — |

### §6.3 字典树优化 DP
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 139 | [单词拆分](https://leetcode.cn/problems/word-break/) | — |
| 140 | [单词拆分 II](https://leetcode.cn/problems/word-break-ii/) | — |
| 面试题 17.13 | [恢复空格](https://leetcode.cn/problems/面试题-17.13/) | — |
| 472 | [连接词](https://leetcode.cn/problems/concatenated-words/) | 2300 |
| 2977 | [转换字符串的最小成本 II](https://leetcode.cn/problems/minimum-cost-to-convert-string-ii/) | 2696 |

### §6.4 0-1 字典树（异或字典树）
部分题目也可以用试填法解决。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 421 | [数组中两个数的最大异或值](https://leetcode.cn/problems/maximum-xor-of-two-numbers-in-an-array/) | 2000 |
| 2935 | [找出强数对的最大异或值 II](https://leetcode.cn/problems/maximum-strong-pair-xor-ii/) | 2349 |
| 3845 | [最大子数组异或值](https://leetcode.cn/problems/maximum-subarray-xor-with-bounded-range/) | — |
| 1707 | [与数组中元素的最大异或值](https://leetcode.cn/problems/maximum-xor-with-an-element-from-array/) | 2359 |
| 1803 | [统计异或值在范围内的数对有多少](https://leetcode.cn/problems/count-pairs-with-xor-in-a-range/) | 2479 |
| 1938 | [查询最大基因差](https://leetcode.cn/problems/maximum-genetic-difference-query/) | 2503 |
| 3632 | [异或至少为 K 的子数组数目 🔒](https://leetcode.cn/problems/subarrays-with-xor-at-least-k/) | — |
| 2479 | [两个不重叠子树的最大异或值 🔒](https://leetcode.cn/problems/maximum-xor-of-two-non-overlapping-subtrees/) | — |

## 七、并查集
模板：

// 模板来源 https://leetcode.cn/circle/discuss/mOr1u6/
class UnionFind {
    vector<int> fa; // 代表元
    vector<int> sz; // 集合大小

public:
    int cc; // 连通块个数

    UnionFind(int n) : fa(n), sz(n, 1), cc(n) {
        // 一开始有 n 个集合 {0}, {1}, ..., {n-1}
        // 集合 i 的代表元是自己，大小为 1
        ranges::iota(fa, 0); // iota(fa.begin(), fa.end(), 0);
    }

    // 返回 x 所在集合的代表元
    // 同时做路径压缩，也就是把 x 所在集合中的所有元素的 fa 都改成代表元
    int find(int x) {
        // 如果 fa[x] == x，则表示 x 是代表元
        if (fa[x] != x) {
            fa[x] = find(fa[x]); // fa 改成代表元
        }
        return fa[x];
    }

    // 判断 x 和 y 是否在同一个集合
    bool is_same(int x, int y) {
        // 如果 x 的代表元和 y 的代表元相同，那么 x 和 y 就在同一个集合
        // 这就是代表元的作用：用来快速判断两个元素是否在同一个集合
        return find(x) == find(y);
    }

    // 把 from 所在集合合并到 to 所在集合中
    // 返回是否合并成功
    bool merge(int from, int to) {
        int x = find(from), y = find(to);
        if (x == y) { // from 和 to 在同一个集合，不做合并
            return false;
        }
        fa[x] = y; // 合并集合。修改后就可以认为 from 和 to 在同一个集合了
        sz[y] += sz[x]; // 更新集合大小（注意集合大小保存在代表元上）
        // 无需更新 sz[x]，因为我们不用 sz[x] 而是用 sz[find(x)] 获取集合大小，但 find(x) == y，我们不会再访问 sz[x]
        cc--; // 成功合并，连通块个数减一
        return true;
    }

    // 返回 x 所在集合的大小
    int get_size(int x) {
        return sz[find(x)]; // 集合大小保存在代表元上
    }
};
### §7.1 基础
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 684 | [冗余连接 做法不止一种](https://leetcode.cn/problems/redundant-connection/) | — |
| 3493 | [属性图](https://leetcode.cn/problems/properties-graph/) | 1565 |
| 990 | [等式方程的可满足性](https://leetcode.cn/problems/satisfiability-of-equality-equations/) | 1638 |
| 721 | [账户合并](https://leetcode.cn/problems/accounts-merge/) | — |
| 3532 | [针对图的路径存在性查询 I 有更简单的做法](https://leetcode.cn/problems/path-existence-queries-in-a-graph-i/) | — |
| 737 | [句子相似性 II 🔒](https://leetcode.cn/problems/sentence-similarity-ii/) | — |
| 1101 | [彼此熟识的最早时间 🔒](https://leetcode.cn/problems/the-earliest-moment-when-everyone-become-friends/) | — |
| 1258 | [近义词句子 🔒](https://leetcode.cn/problems/synonymous-sentences/) | — |

更多基础题，见 网格图题单 中的 DFS 和 图论题单 中的 DFS，其中大部分题目也可以用并查集实现。

### §7.2 进阶
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3551 | [数位和排序需要的最小交换次数  置换环](https://leetcode.cn/problems/minimum-swaps-to-sort-by-digit-sum/) | 1507 |
| 2471 | [逐层排序二叉树所需的最少操作数目  置换环](https://leetcode.cn/problems/minimum-number-of-operations-to-sort-a-binary-tree-by-level/) | 1635 |
| 1202 | [交换字符串中的元素](https://leetcode.cn/problems/smallest-string-with-swaps/) | 1855 |
| 1061 | [按字典序排列最小的等效字符串](https://leetcode.cn/problems/lexicographically-smallest-equivalent-string/) | — |
| 1722 | [执行交换操作后的最小汉明距离](https://leetcode.cn/problems/minimize-hamming-distance-after-swap-operations/) | 1892 |
| 3608 | [包含 K 个连通分量需要的最小时间](https://leetcode.cn/problems/minimum-time-for-k-connected-components/) | 1893 |
| 3613 | [最小化连通分量的最大成本 类似  题](https://leetcode.cn/problems/minimize-maximum-component-cost/) | 3608 |
| 778 | [水位上升的泳池中游泳](https://leetcode.cn/problems/swim-in-rising-water/) | — |
| 3695 | [交换元素后的最大交替和  证明](https://leetcode.cn/problems/maximize-alternating-sum-using-swaps/) | 1984 |
| 765 | [情侣牵手](https://leetcode.cn/problems/couples-holding-hands/) | 1999 |
| 2092 | [找出知晓秘密的所有专家](https://leetcode.cn/problems/find-all-people-with-secret/) | 2004 |
| 839 | [相似字符串组](https://leetcode.cn/problems/similar-string-groups/) | 2054 |
| 685 | [冗余连接 II](https://leetcode.cn/problems/redundant-connection-ii/) | — |
| 1970 | [你能穿过矩阵的最后一天](https://leetcode.cn/problems/last-day-where-you-can-still-cross/) | 2124 |
| 2076 | [处理含限制条件的好友请求](https://leetcode.cn/problems/process-restricted-friend-requests/) | 2131 |
| 1579 | [保证图可完全遍历](https://leetcode.cn/problems/remove-max-number-of-edges-to-keep-graph-fully-traversable/) | 2132 |
| 959 | [由斜杠划分区域](https://leetcode.cn/problems/regions-cut-by-slashes/) | 2136 |
| 2812 | [找出最安全路径](https://leetcode.cn/problems/find-the-safest-path-in-a-grid/) | 2154 |
| 2503 | [矩阵查询可获得的最大分数](https://leetcode.cn/problems/maximum-number-of-points-from-grid-queries/) | 2196 |
| 3600 | [升级后最大生成树稳定性](https://leetcode.cn/problems/maximize-spanning-tree-stability-with-upgrades/) | 2301 |
| 2867 | [统计树中的合法路径数目](https://leetcode.cn/problems/count-valid-paths-in-a-tree/) | 2428 |
| 2421 | [好路径的数目](https://leetcode.cn/problems/number-of-good-paths/) | 2445 |
| 2157 | [字符串分组](https://leetcode.cn/problems/groups-of-strings/) | 2499 |
| 803 | [打砖块](https://leetcode.cn/problems/bricks-falling-when-hit/) | 2765 |
| 3235 | [判断矩形的两个角落是否可达](https://leetcode.cn/problems/check-if-the-rectangle-corner-is-reachable/) | — |
| LCP 71 | [集水器](https://leetcode.cn/problems/lcp-71/) | — |
| 2459 | [通过移动项目到空白区域来排序数组置换 🔒](https://leetcode.cn/problems/sort-array-by-moving-items-to-empty-space/) | — |

另见 图论题单 中的最小生成树。

### §7.3 中介并查集
把 n 个元素两两相连，要连 O(n 
2
 ) 条边，太慢了。而把元素连到中介上，通常只会连 O(n) 条边。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 947 | [移除最多的同行或同列石头](https://leetcode.cn/problems/most-stones-removed-with-same-row-or-column/) | 2035 |
| 3873 | [添加一个点后可激活的最大点数](https://leetcode.cn/problems/maximum-points-activated-with-one-addition/) | — |
| 2709 | [最大公约数遍历](https://leetcode.cn/problems/greatest-common-divisor-traversal/) | 2172 |
| 1627 | [带阈值的图连通性](https://leetcode.cn/problems/graph-connectivity-with-threshold/) | 2221 |
| 952 | [按公因数计算最大组件大小](https://leetcode.cn/problems/largest-component-size-by-common-factor/) | 2272 |
| 1998 | [数组的最大公因数排序](https://leetcode.cn/problems/gcd-sort-of-an-array/) | 2429 |
| 1632 | [矩阵转换后的排名](https://leetcode.cn/problems/rank-transform-of-a-matrix/) | 2530 |
| 3378 | [统计最小公倍数图中的连通块数目  思路类似  题](https://leetcode.cn/problems/count-connected-components-in-lcm-graph/) | 2532 |
| 2371 | [最小化网格中的最大值同  题 🔒](https://leetcode.cn/problems/minimize-maximum-value-in-a-grid/) | 1632 |

### §7.4 数组上的并查集
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1562 | [查找大小为 M 的最新分组](https://leetcode.cn/problems/find-latest-group-of-size-m/) | 1928 |
| 1488 | [避免洪水泛滥](https://leetcode.cn/problems/avoid-flood-in-the-city/) | 1974 |
| 1353 | [最多可以参加的会议数目](https://leetcode.cn/problems/maximum-number-of-events-that-can-be-attended/) | 2016 |
| 2382 | [删除操作后的最大子段和](https://leetcode.cn/problems/maximum-segment-sum-after-removals/) | 2136 |
| 2334 | [元素值大于变化阈值的子数组](https://leetcode.cn/problems/subarray-with-elements-greater-than-varying-threshold/) | 2381 |
| 3666 | [使二进制字符串全为 1 的最少操作次数](https://leetcode.cn/problems/minimum-operations-to-equalize-binary-string/) | 2477 |
| 2612 | [最少翻转操作数](https://leetcode.cn/problems/minimum-reverse-operations/) | 2824 |

### §7.5 区间并查集
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3244 | [新增道路查询后的最短距离 II](https://leetcode.cn/problems/shortest-distance-after-road-addition-queries-ii/) | 2270 |
| 1851 | [包含每个查询的最小区间](https://leetcode.cn/problems/minimum-interval-to-include-each-query/) | 2286 |
| LCP 52 | [二叉搜索树染色](https://leetcode.cn/problems/lcp-52/) | — |
| 2158 | [每天绘制新区域的数量 🔒](https://leetcode.cn/problems/amount-of-new-area-painted-each-day/) | — |

### §7.6 带权并查集（边权并查集）
模板：

// 模板来源 https://leetcode.cn/circle/discuss/mOr1u6/
// 根据题目用 UnionFind<int> uf(n) 或者 UnionFind<long long> uf(n) 初始化
template<typename T>
class UnionFind {
public:
    vector<int> fa; // 代表元
    vector<T> dis; // dis[x] 表示 x 到（x 所在集合的）代表元的距离

    UnionFind(int n) : fa(n), dis(n) {
        // 一开始有 n 个集合 {0}, {1}, ..., {n-1}
        // 集合 i 的代表元是自己，自己到自己的距离是 0
        ranges::iota(fa, 0); // iota(fa.begin(), fa.end(), 0);
    }

    // 返回 x 所在集合的代表元
    // 同时做路径压缩
    int find(int x) {
        if (fa[x] != x) {
            int root = find(fa[x]);
            dis[x] += dis[fa[x]]; // 递归更新 x 到其代表元的距离
            fa[x] = root;
        }
        return fa[x];
    }

    // 判断 x 和 y 是否在同一个集合（同普通并查集）
    bool same(int x, int y) {
        return find(x) == find(y);
    }

    // 计算从 from 到 to 的相对距离
    // 调用时需保证 from 和 to 在同一个集合中，否则返回值无意义
    T get_relative_distance(int from, int to) {
        find(from);
        find(to);
        // to-from = (x-from) - (x-to) = dis[from] - dis[to]
        return dis[from] - dis[to];
    }

    // 合并 from 和 to，新增信息 to - from = value
    // 其中 to 和 from 表示未知量，下文的 x 和 y 也表示未知量
    // 如果 from 和 to 不在同一个集合，返回 true，否则返回是否与已知信息矛盾
    bool merge(int from, int to, T value) {
        int x = find(from), y = find(to);
        if (x == y) { // from 和 to 在同一个集合，不做合并
            // to-from = (x-from) - (x-to) = dis[from] - dis[to] = value
            return dis[from] - dis[to] == value;
        }
        //    x --------- y
        //   /           /
        // from ------- to
        // 已知 x-from = dis[from] 和 y-to = dis[to]，现在合并 from 和 to，新增信息 to-from = value
        // 由于 y-from = (y-x) + (x-from) = (y-to) + (to-from)
        // 所以 y-x = (to-from) + (y-to) - (x-from) = value + dis[to] - dis[from]
        dis[x] = value + dis[to] - dis[from]; // 计算 x 到其代表元 y 的距离
        fa[x] = y;
        return true;
    }
};
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 399 | [除法求值 模板题](https://leetcode.cn/problems/evaluate-division/) | — |
| 3710 | [最大划分因子](https://leetcode.cn/problems/maximum-partition-factor/) | 2135 |
| 2307 | [检查方程中的矛盾之处 🔒](https://leetcode.cn/problems/check-for-contradictions-in-equations/) | — |

附加模板题：CF1850H

## 八、树状数组和线段树
能用树状数组解决的题目，也能用线段树解决（反过来不一定）。但树状数组实现简单，代码短。

为方便大家练习，我把适合用树状数组解决的题目分到树状数组中，其余分到线段树中。

### §8.1 树状数组
讲解：带你发明树状数组！附数学证明

模板：

// 模板来源 https://leetcode.cn/circle/discuss/mOr1u6/
// 根据题目用 FenwickTree<int> t(n) 或者 FenwickTree<long long> t(n) 初始化
template<typename T>
class FenwickTree {
    vector<T> tree;

public:
    // 使用下标 1 到 n
    FenwickTree(int n) : tree(n + 1) {}

    // a[i] 增加 val
    // 1 <= i <= n
    // 时间复杂度 O(log n)
    void update(int i, T val) {
        for (; i < tree.size(); i += i & -i) {
            tree[i] += val;
        }
    }

    // 求前缀和 a[1] + ... + a[i]
    // 1 <= i <= n
    // 时间复杂度 O(log n)
    T pre(int i) const {
        T res = 0;
        for (; i > 0; i &= i - 1) {
            res += tree[i];
        }
        return res;
    }

    // 求区间和 a[l] + ... + a[r]
    // 1 <= l <= r <= n
    // 时间复杂度 O(log n)
    T query(int l, int r) const {
        if (r < l) {
            return 0;
        }
        return pre(r) - pre(l - 1);
    }
};
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 307 | [区域和检索 - 数组可修改](https://leetcode.cn/problems/range-sum-query-mutable/) | — |
| 3072 | [将元素分配到两个数组中 II  离散化](https://leetcode.cn/problems/distribute-elements-into-two-arrays-ii/) | 2053 |
| 3624 | [位计数深度为 K 的整数数目 II](https://leetcode.cn/problems/number-of-integers-with-popcount-depth-equal-to-k-ii/) | 2086 |
| 3187 | [数组中的峰值](https://leetcode.cn/problems/peaks-in-array/) | 2154 |
| 3777 | [使子字符串变交替的最少删除次数  做法不止一种](https://leetcode.cn/problems/minimum-deletions-to-make-alternating-substring/) | 2202 |
| 1649 | [通过指令创建有序数组](https://leetcode.cn/problems/create-sorted-array-through-instructions/) | 2208 |
| 1626 | [无矛盾的最佳球队](https://leetcode.cn/problems/best-team-with-no-conflicts/) | — |
| 1409 | [查询带键的排列](https://leetcode.cn/problems/queries-on-a-permutation-with-key/) | — |
| 2250 | [统计包含每个点的矩形数目](https://leetcode.cn/problems/count-number-of-rectangles-containing-each-point/) | — |
| 2179 | [统计数组中好三元组数目](https://leetcode.cn/problems/count-good-triplets-in-an-array/) | 2272 |
| 1395 | [统计作战单位数](https://leetcode.cn/problems/count-number-of-teams/) | — |
| 2659 | [将数组清空](https://leetcode.cn/problems/make-array-empty/) | 2282 |
| 2653 | [滑动子数组的美丽值 树状数组二分](https://leetcode.cn/problems/sliding-subarray-beauty/) | — |
| 3515 | [带权树中的最短路径  差分树状数组](https://leetcode.cn/problems/shortest-path-in-a-weighted-tree/) | 2312 |
| LCP 05 | [发 LeetCoin 同  题](https://leetcode.cn/problems/lcp-05/) | 3515 |
| 1505 | [最多 K 次交换相邻数位后得到的最小整数](https://leetcode.cn/problems/minimum-possible-integer-after-at-most-k-adjacent-swaps-on-digits/) | 2337 |
| 3841 | [查询树上回文路径  差分树状数组](https://leetcode.cn/problems/palindromic-path-queries-in-a-tree/) | 2384 |
| 2926 | [平衡子序列的最大和](https://leetcode.cn/problems/maximum-balanced-subsequence-sum/) | 2448 |
| 2736 | [最大和查询](https://leetcode.cn/problems/maximum-sum-queries/) | 2533 |
| 3671 | [子序列美丽值求和  时间戳 懒初始化](https://leetcode.cn/problems/sum-of-beautiful-subsequences/) | 2647 |
| 3382 | [用点构造面积最大的矩形 II  静态二维数点](https://leetcode.cn/problems/maximum-area-rectangle-with-point-constraints-ii/) | 2723 |
| 3590 | [第 K 小的路径异或和 权值树状数组第 k 小](https://leetcode.cn/problems/kth-smallest-path-xor-sum/) | — |
| 3245 | [交替组 III](https://leetcode.cn/problems/alternating-groups-iii/) | 3112 |
| 3027 | [人员站位的方案数 II CDQ 分治](https://leetcode.cn/problems/find-the-number-of-ways-to-place-people-ii/) | — |
| 1756 | [设计最近使用（MRU）队列 🔒](https://leetcode.cn/problems/design-most-recently-used-queue/) | — |
| 60 | [排列序列 康托展开，可以做到 O(nlogn)](https://leetcode.cn/problems/permutation-sequence/) | — |
| 3109 | [查找排列的下标60 题的数据加强版 🔒](https://leetcode.cn/problems/find-the-index-of-permutation/) | — |
| 2519 | [统计 K-Big 索引的数量 🔒](https://leetcode.cn/problems/count-the-number-of-k-big-indices/) | — |
| 2613 | [美数对曼哈顿最近点对 🔒](https://leetcode.cn/problems/beautiful-pairs/) | — |
| 2921 | [价格递增的最大利润三元组 II 🔒](https://leetcode.cn/problems/maximum-profitable-triplets-with-increasing-prices-ii/) | — |
| 308 | [二维区域和检索 - 可变 🔒](https://leetcode.cn/problems/range-sum-query-2d-mutable/) | — |

另见本题单的「§5.7 对顶堆」，部分题目也可以用权值树状数组第 k 小解决。

### §8.2 逆序对
除了可以用树状数组解决，部分题目也可以在归并排序的同时计算。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| LCR 170 | [交易逆序对的总数](https://leetcode.cn/problems/lcr-170/) | — |
| 315 | [计算右侧小于当前元素的个数](https://leetcode.cn/problems/count-of-smaller-numbers-after-self/) | — |
| 493 | [翻转对](https://leetcode.cn/problems/reverse-pairs/) | — |
| 327 | [区间和的个数](https://leetcode.cn/problems/count-of-range-sum/) | — |
| 2426 | [满足不等式的数对数目](https://leetcode.cn/problems/number-of-pairs-satisfying-inequality/) | 2030 |
| 3768 | [固定长度子数组中的最小逆序对数目](https://leetcode.cn/problems/minimum-inversion-count-in-subarrays-of-fixed-length/) | 2158 |
| 1850 | [邻位交换的最小次数](https://leetcode.cn/problems/minimum-adjacent-swaps-to-reach-the-kth-smallest-number/) | — |
| 2193 | [得到回文串的最少操作次数](https://leetcode.cn/problems/minimum-number-of-moves-to-make-palindrome/) | — |
| 1885 | [统计数对 🔒](https://leetcode.cn/problems/count-pairs-in-two-arrays/) | — |

### §8.3 线段树（无区间更新）
线段树本质是二叉树，在学习之前，建议先做做 104. 二叉树的最大深度 和 111. 二叉树的最小深度（自底向上写法），当作热身。

线段树：为什么要这样设计？ 理解线段树发明的动机。

把任意区间用 O(logn) 个区间表示，线段树的每个节点记录对应区间的信息。

询问：把询问区间拆分成 O(logn) 个区间，对应着线段树的 O(logn) 个节点，把这 O(logn) 个节点的信息合并，即为答案。
单点更新：有 O(logn) 个区间包含被修改的位置，需要更新 O(logn) 个节点的信息。
基础模板代码如下。为方便入门理解，我没有做复杂封装。通用模板代码可以参考 AtCoder Library 的 segtree.hpp。

// 模板来源 https://leetcode.cn/circle/discuss/mOr1u6/
// 线段树有两个下标，一个是线段树节点的下标，另一个是线段树维护的区间的下标
// 节点的下标：从 1 开始，如果你想改成从 0 开始，需要把左右儿子下标分别改成 node*2+1 和 node*2+2
// 区间的下标：从 0 开始
template<typename T>
class SegmentTree {
    // 注：也可以去掉 template<typename T>，改在这里定义 T
    // using T = pair<int, int>;

    int n;
    vector<T> tree;

    // 合并两个 val
    T merge_val(T a, T b) const {
        return max(a, b); // **根据题目修改**
    }

    // 合并左右儿子的 val 到当前节点的 val
    void maintain(int node) {
        tree[node] = merge_val(tree[node * 2], tree[node * 2 + 1]);
    }

    // 用 a 初始化线段树
    // 时间复杂度 O(n)
    void build(const vector<T>& a, int node, int l, int r) {
        if (l == r) { // 叶子
            tree[node] = a[l]; // 初始化叶节点的值
            return;
        }
        int m = (l + r) / 2;
        build(a, node * 2, l, m); // 初始化左子树
        build(a, node * 2 + 1, m + 1, r); // 初始化右子树
        maintain(node);
    }

    void update(int node, int l, int r, int i, T val) {
        if (l == r) { // 叶子（到达目标）
            // 如果想直接替换的话，可以写 tree[node] = val
            tree[node] = merge_val(tree[node], val);
            return;
        }
        int m = (l + r) / 2;
        if (i <= m) { // i 在左子树
            update(node * 2, l, m, i, val);
        } else { // i 在右子树
            update(node * 2 + 1, m + 1, r, i, val);
        }
        maintain(node);
    }

    T query(int node, int l, int r, int ql, int qr) const {
        if (ql <= l && r <= qr) { // 当前子树完全在 [ql, qr] 内
            return tree[node];
        }
        int m = (l + r) / 2;
        if (qr <= m) { // [ql, qr] 在左子树
            return query(node * 2, l, m, ql, qr);
        }
        if (ql > m) { // [ql, qr] 在右子树
            return query(node * 2 + 1, m + 1, r, ql, qr);
        }
        T l_res = query(node * 2, l, m, ql, qr);
        T r_res = query(node * 2 + 1, m + 1, r, ql, qr);
        return merge_val(l_res, r_res);
    }

public:
    // 线段树维护一个长为 n 的数组（下标从 0 到 n-1），元素初始值为 init_val
    SegmentTree(int n, T init_val) : SegmentTree(vector<T>(n, init_val)) {}

    // 线段树维护数组 a
    SegmentTree(const vector<T>& a) : n(a.size()), tree(2 << bit_width(a.size() - 1)) {
        build(a, 1, 0, n - 1);
    }

    // 更新 a[i] 为 merge_val(a[i], val)
    // 时间复杂度 O(log n)
    void update(int i, T val) {
        update(1, 0, n - 1, i, val);
    }

    // 返回用 merge_val 合并所有 a[i] 的计算结果，其中 i 在闭区间 [ql, qr] 中
    // 时间复杂度 O(log n)
    T query(int ql, int qr) const {
        return query(1, 0, n - 1, ql, qr);
    }

    // 获取 a[i] 的值
    // 时间复杂度 O(log n)
    T get(int i) const {
        return query(1, 0, n - 1, i, i);
    }
};

int main() {
    SegmentTree t(8, 0LL); // 如果这里写 0LL，那么 SegmentTree 存储的就是 long long 数据
    t.update(0, 1LL << 60);
    cout << t.query(0, 7) << endl;

    vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6};
    // 注意：如果要让 SegmentTree 存储 long long 数据，需要传入 vector<long long>
    SegmentTree t2(nums); // 这里 SegmentTree 存储的是 int 数据
    cout << t2.query(0, 7) << endl;
    return 0;
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3479 | [水果成篮 III  线段树二分](https://leetcode.cn/problems/fruits-into-baskets-iii/) | 2178 |
| 2940 | [找到 Alice 和 Bob 可以相遇的建筑  线段树二分](https://leetcode.cn/problems/find-building-where-alice-and-bob-can-meet/) | 2327 |
| 2286 | [以组为单位订音乐会的门票  线段树二分](https://leetcode.cn/problems/booking-concert-tickets-in-groups/) | 2470 |
| 3161 | [物块放置查询](https://leetcode.cn/problems/block-placement-queries/) | 2513 |
| 2213 | [由单个字符重复的最长子字符串](https://leetcode.cn/problems/longest-substring-of-one-repeating-character/) | 2629 |
| 3777 | [使子字符串变交替的最少删除次数](https://leetcode.cn/problems/minimum-deletions-to-make-alternating-substring/) | — |
| 3525 | [求出数组的 X 值 II](https://leetcode.cn/problems/find-x-value-of-array-ii/) | 2645 |
| 3165 | [不包含相邻元素的子序列的最大和](https://leetcode.cn/problems/maximum-sum-of-subsequence-with-non-adjacent-elements/) | 2697 |
| 3410 | [删除所有值为某个元素后的最大子数组和  做法不止一种](https://leetcode.cn/problems/maximize-subarray-sum-after-removing-all-occurrences-of-one-element/) | 2844 |
| 3501 | [操作后最大活跃区段数 II](https://leetcode.cn/problems/maximize-active-section-with-trade-ii/) | 2941 |
| LCP 81 | [与非的谜题](https://leetcode.cn/problems/lcp-81/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1157 | [子数组中占绝大多数的元素](https://leetcode.cn/problems/online-majority-element-in-subarray/) | 2205 |
| 2407 | [最长递增子序列 II](https://leetcode.cn/problems/longest-increasing-subsequence-ii/) | 2280 |

### §8.4 Lazy 线段树（有区间更新）
把任意区间用 O(logn) 个区间表示，线段树的每个节点记录对应区间的信息。

询问：把询问区间拆分成 O(logn) 个区间，对应着线段树的 O(logn) 个节点，把这 O(logn) 个节点的信息合并，即为答案。
区间更新：仍然是拆分成 O(logn) 个区间，对应着线段树的 O(logn) 个节点。但对于其中的非叶节点，不把更新的内容往下传递给子节点，而是记录「发生了更新，内容为 xxx」，把更新的内容记录下来。直到后续的询问或更新操作，需要访问或修改更下面的子节点信息时，才把更新的内容往下传。
基础模板代码如下。为方便入门理解，我没有做复杂封装。通用模板代码可以参考 AtCoder Library 的 lazysegtree.hpp。

// 模板来源 https://leetcode.cn/circle/discuss/mOr1u6/
template<typename T, typename F>
class LazySegmentTree {
    // 注：也可以去掉 template<typename T, typename F>，改在这里定义 T 和 F
    // using T = pair<int, int>;
    // using F = pair<int, int>;

    // 懒标记初始值
    const F TODO_INIT = 0; // **根据题目修改**

    struct Node {
        T val;
        F todo;
    };

    int n;
    vector<Node> tree;

    // 合并两个 val
    T merge_val(const T& a, const T& b) const {
        return a + b; // **根据题目修改**
    }

    // 合并两个懒标记
    F merge_todo(const F& a, const F& b) const {
        return a + b; // **根据题目修改**
    }

    // 把懒标记作用到 node 子树（本例为区间加）
    void apply(int node, int l, int r, F todo) {
        Node& cur = tree[node];
        // 计算 tree[node] 区间的整体变化
        cur.val += todo * (r - l + 1); // **根据题目修改**
        cur.todo = merge_todo(todo, cur.todo);
    }

    // 把当前节点的懒标记下传给左右儿子
    void spread(int node, int l, int r) {
        Node& cur = tree[node];
        F todo = cur.todo;
        if (todo == TODO_INIT) { // 没有需要下传的信息
            return;
        }
        int m = (l + r) / 2;
        apply(node * 2, l, m, todo);
        apply(node * 2 + 1, m + 1, r, todo);
        cur.todo = TODO_INIT; // 下传完毕
    }

    // 合并左右儿子的 val 到当前节点的 val
    void maintain(int node) {
        tree[node].val = merge_val(tree[node * 2].val, tree[node * 2 + 1].val);
    }

    // 用 a 初始化线段树
    // 时间复杂度 O(n)
    void build(const vector<T>& a, int node, int l, int r) {
        Node& cur = tree[node];
        cur.todo = TODO_INIT;
        if (l == r) { // 叶子
            cur.val = a[l]; // 初始化叶节点的值
            return;
        }
        int m = (l + r) / 2;
        build(a, node * 2, l, m); // 初始化左子树
        build(a, node * 2 + 1, m + 1, r); // 初始化右子树
        maintain(node);
    }

    void update(int node, int l, int r, int ql, int qr, F f) {
        if (ql <= l && r <= qr) { // 当前子树完全在 [ql, qr] 内
            apply(node, l, r, f);
            return;
        }
        spread(node, l, r);
        int m = (l + r) / 2;
        if (ql <= m) { // 更新左子树
            update(node * 2, l, m, ql, qr, f);
        }
        if (qr > m) { // 更新右子树
            update(node * 2 + 1, m + 1, r, ql, qr, f);
        }
        maintain(node);
    }

    T query(int node, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) { // 当前子树完全在 [ql, qr] 内
            return tree[node].val;
        }
        spread(node, l, r);
        int m = (l + r) / 2;
        if (qr <= m) { // [ql, qr] 在左子树
            return query(node * 2, l, m, ql, qr);
        }
        if (ql > m) { // [ql, qr] 在右子树
            return query(node * 2 + 1, m + 1, r, ql, qr);
        }
        T l_res = query(node * 2, l, m, ql, qr);
        T r_res = query(node * 2 + 1, m + 1, r, ql, qr);
        return merge_val(l_res, r_res);
    }

public:
    // 线段树维护一个长为 n 的数组（下标从 0 到 n-1），元素初始值为 init_val
    LazySegmentTree(int n, T init_val = 0) : LazySegmentTree(vector<T>(n, init_val)) {}

    // 线段树维护数组 a
    LazySegmentTree(const vector<T>& a) : n(a.size()), tree(2 << bit_width(a.size() - 1)) {
        build(a, 1, 0, n - 1);
    }

    // 用 f 更新 [ql, qr] 中的每个 a[i]
    // 0 <= ql <= qr <= n-1
    // 时间复杂度 O(log n)
    void update(int ql, int qr, F f) {
        update(1, 0, n - 1, ql, qr, f);
    }

    // 返回用 merge_val 合并所有 a[i] 的计算结果，其中 i 在闭区间 [ql, qr] 中
    // 0 <= ql <= qr <= n-1
    // 时间复杂度 O(log n)
    T query(int ql, int qr) {
        return query(1, 0, n - 1, ql, qr);
    }
};

int main() {
    LazySegmentTree<long long, long long> t(8); // 默认值为 0
    t.update(3, 5, 100);
    t.update(4, 6, 10);
    cout << t.query(0, 7) << endl;

    vector<long long> nums = {3, 1, 4, 1, 5, 9, 2, 6};
    LazySegmentTree<long long, long long> t2(nums);
    t2.update(3, 5, 1);
    t2.update(4, 6, 1);
    cout << t2.query(0, 7) << endl;
    return 0;
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2569 | [更新数组后处理求和查询](https://leetcode.cn/problems/handling-sum-queries-after-update/) | 2398 |
| 1622 | [奇妙序列  做法不止一种](https://leetcode.cn/problems/fancy-sequence/) | 2476 |
| 2502 | [设计内存分配器](https://leetcode.cn/problems/design-memory-allocator/) | — |
| 2589 | [完成所有任务的最少时间](https://leetcode.cn/problems/minimum-time-to-complete-all-tasks/) | — |
| 2547 | [拆分数组的最小代价](https://leetcode.cn/problems/minimum-cost-to-split-an-array/) | — |
| 850 | [矩形面积 II 矩形面积并 扫描线 离散化](https://leetcode.cn/problems/rectangle-area-ii/) | — |
| 3454 | [分割正方形 II](https://leetcode.cn/problems/separate-squares-ii/) | 2671 |
| 3569 | [分割数组后不同质数的最大数目](https://leetcode.cn/problems/maximize-count-of-distinct-primes-after-split/) | 2697 |
| 3721 | [最长平衡子数组 II  HH 项链 trick](https://leetcode.cn/problems/longest-balanced-subarray-ii/) | 2724 |
| 2916 | [子数组不同元素数目的平方和 II](https://leetcode.cn/problems/subarrays-distinct-element-sum-of-squares-ii/) | 2816 |
| LCP 52 | [二叉搜索树染色](https://leetcode.cn/problems/lcp-52/) | — |

### §8.5 动态开点线段树
部分题目也可以用珂朵莉树解决。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 699 | [掉落的方块](https://leetcode.cn/problems/falling-squares/) | — |
| 715 | [Range 模块](https://leetcode.cn/problems/range-module/) | — |
| 729 | [我的日程安排表 I](https://leetcode.cn/problems/my-calendar-i/) | — |
| 731 | [我的日程安排表 II](https://leetcode.cn/problems/my-calendar-ii/) | — |
| 732 | [我的日程安排表 III](https://leetcode.cn/problems/my-calendar-iii/) | — |
| 2276 | [统计区间中的整数数目](https://leetcode.cn/problems/count-integers-in-intervals/) | 2222 |
| 2770 | [达到末尾下标所需的最大跳跃次数](https://leetcode.cn/problems/maximum-number-of-jumps-to-reach-the-last-index/) | — |
| 3590 | [第 K 小的路径异或和  线段树合并](https://leetcode.cn/problems/kth-smallest-path-xor-sum/) | 2646 |

### §8.6 可持久化线段树
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3762 | [使数组元素相等的最小操作次数](https://leetcode.cn/problems/minimum-operations-to-equalize-subarrays/) | 2497 |

### §8.7 ST 表（Sparse Table）
ST 表 支持区间最值查询（Range Minimum/Maximum Query，RMQ），但不支持修改。

优点是代码短，且查询的时间复杂度是 O(1)。所以作为补充内容，附在此处。

class SparseTable {
    vector<vector<int>> st_min;
    vector<vector<int>> st_max;

public:
    // 时间复杂度 O(n * log n)
    SparseTable(const vector<int>& nums) {
        int n = nums.size();
        int w = bit_width((uint32_t) n);
        st_min.resize(w, vector<int>(n));
        st_max.resize(w, vector<int>(n));

        for (int j = 0; j < n; j++) {
            st_min[0][j] = nums[j];
            st_max[0][j] = nums[j];
        }

        for (int i = 1; i < w; i++) {
            for (int j = 0; j + (1 << i) <= n; j++) {
                st_min[i][j] = min(st_min[i - 1][j], st_min[i - 1][j + (1 << (i - 1))]);
                st_max[i][j] = max(st_max[i - 1][j], st_max[i - 1][j + (1 << (i - 1))]);
            }
        }
    }

    // [l, r) 左闭右开，下标从 0 开始
    // 必须保证 l < r
    // 时间复杂度 O(1)
    int query_min(int l, int r) const {
        int k = bit_width((uint32_t) r - l) - 1;
        return min(st_min[k][l], st_min[k][r - (1 << k)]);
    }

    // [l, r) 左闭右开，下标从 0 开始
    // 必须保证 l < r
    // 时间复杂度 O(1)
    int query_max(int l, int r) const {
        int k = bit_width((uint32_t) r - l) - 1;
        return max(st_max[k][l], st_max[k][r - (1 << k)]);
    }
};
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3691 | [最大子数组总值 II](https://leetcode.cn/problems/maximum-total-subarray-value-ii/) | 2469 |
| 3501 | [操作后最大活跃区段数 II](https://leetcode.cn/problems/maximize-active-section-with-trade-ii/) | 2941 |

## 九、伸展树（Splay 树）
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2296 | [设计一个文本编辑器](https://leetcode.cn/problems/design-a-text-editor/) | — |
| 3526 | [范围异或查询与子数组反转 🔒](https://leetcode.cn/problems/range-xor-queries-with-subarray-reversals/) | — |

## 十、根号算法
### §8.1 根号分解（Sqrt Decomposition）
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3655 | [区间乘法查询后的异或 II](https://leetcode.cn/problems/xor-after-range-multiplication-queries-ii/) | 2454 |
| LCP 16 | [游乐园的游览计划](https://leetcode.cn/problems/lcp-16/) | — |
| 1714 | [数组中特殊等间距元素的和 🔒](https://leetcode.cn/problems/sum-of-special-evenly-spaced-elements-in-array/) | — |
| 3400 | [右移后的最大匹配索引数非暴力做法 🔒](https://leetcode.cn/problems/maximum-number-of-matching-indices-after-right-shifts/) | — |

### §8.2 莫队算法
属于离线算法的一种。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3636 | [查询超过阈值频率最高元素  回滚莫队](https://leetcode.cn/problems/threshold-majority-queries/) | 2451 |
| 3590 | [第 K 小的路径异或和  做法不止一种 分块](https://leetcode.cn/problems/kth-smallest-path-xor-sum/) | 2646 |

### §8.3 其他
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3234 | [统计 1 显著的字符串的数量](https://leetcode.cn/problems/count-the-number-of-substrings-with-dominant-ones/) | 2557 |

专题：离线算法
通过改变回答询问的顺序，使问题更容易处理。

相应的，在线算法就是按照 queries 的顺序一个一个处理。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2343 | [裁剪数字后查询第 K 小的数字](https://leetcode.cn/problems/query-kth-smallest-trimmed-number/) | 1652 |
| 3607 | [电网维护](https://leetcode.cn/problems/power-grid-maintenance/) | 1700 |
| 2070 | [每一个查询的最大美丽值](https://leetcode.cn/problems/most-beautiful-item-for-each-query/) | 1724 |
| 1847 | [最近的房间](https://leetcode.cn/problems/closest-room/) | 2082 |
| 2503 | [矩阵查询可获得的最大分数](https://leetcode.cn/problems/maximum-number-of-points-from-grid-queries/) | 2196 |
| 1851 | [包含每个查询的最小区间](https://leetcode.cn/problems/minimum-interval-to-include-each-query/) | 2286 |
| 1697 | [检查边长度限制的路径是否存在](https://leetcode.cn/problems/checking-existence-of-edge-length-limited-paths/) | 2300 |
| 2940 | [找到 Alice 和 Bob 可以相遇的建筑](https://leetcode.cn/problems/find-building-where-alice-and-bob-can-meet/) | 2327 |
| 2747 | [统计没有收到请求的服务器数目](https://leetcode.cn/problems/count-zero-request-servers/) | 2405 |
| 1938 | [查询最大基因差](https://leetcode.cn/problems/maximum-genetic-difference-query/) | 2503 |
| 2736 | [最大和查询](https://leetcode.cn/problems/maximum-sum-queries/) | 2533 |
| 3590 | [第 K 小的路径异或和](https://leetcode.cn/problems/kth-smallest-path-xor-sum/) | 2646 |
| 3382 | [用点构造面积最大的矩形 II  静态二维数点](https://leetcode.cn/problems/maximum-area-rectangle-with-point-constraints-ii/) | 2723 |

编程能力强化训练
知道大概怎么做，但不好实现的题目。部分题目是模拟题。

Part A
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 12 | [整数转罗马数字](https://leetcode.cn/problems/integer-to-roman/) | — |
| 13 | [罗马数字转整数](https://leetcode.cn/problems/roman-to-integer/) | — |
| 273 | [整数转换英文表示](https://leetcode.cn/problems/integer-to-english-words/) | — |
| 68 | [文本左右对齐](https://leetcode.cn/problems/text-justification/) | — |
| 420 | [强密码检验器](https://leetcode.cn/problems/strong-password-checker/) | — |
| 8 | [字符串转换整数 (atoi) 为 65 题热身](https://leetcode.cn/problems/string-to-integer-atoi/) | — |
| 65 | [有效数字](https://leetcode.cn/problems/valid-number/) | — |

另见本题单的「§3.5 表达式解析」。

Part B
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 146 | [LRU 缓存](https://leetcode.cn/problems/lru-cache/) | — |
| 460 | [LFU 缓存](https://leetcode.cn/problems/lfu-cache/) | — |
| 432 | [全 O(1) 的数据结构](https://leetcode.cn/problems/all-oone-data-structure/) | — |
| 1206 | [设计跳表](https://leetcode.cn/problems/design-skiplist/) | — |

Part C
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3197 | [包含所有 1 的最小矩形面积 II](https://leetcode.cn/problems/find-the-minimum-area-to-cover-all-ones-ii/) | 2541 |
| 2532 | [过桥的时间](https://leetcode.cn/problems/time-to-cross-a-bridge/) | 2589 |
| 2056 | [棋盘上有效移动组合的数目](https://leetcode.cn/problems/number-of-valid-move-combinations-on-chessboard/) | 2611 |
| LCP 48 | [无限棋局](https://leetcode.cn/problems/lcp-48/) | — |
| LCP 21 | [追逐游戏](https://leetcode.cn/problems/lcp-21/) | — |
| LCP 58 | [积木拼接](https://leetcode.cn/problems/lcp-58/) | — |
| LCP 13 | [寻宝](https://leetcode.cn/problems/lcp-13/) | — |
| LCP 69 | [Hello LeetCode!](https://leetcode.cn/problems/lcp-69/) | — |
| LCP 76 | [魔法棋盘](https://leetcode.cn/problems/lcp-76/) | — |
| LCP 82 | [万灵之树](https://leetcode.cn/problems/lcp-82/) | — |

