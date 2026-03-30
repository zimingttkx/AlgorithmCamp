# Chapter 05 · 位运算

> 来源：[灵茶山艾府题单](https://leetcode.cn/circle/discuss/dHn9Vk/)

---

## 一、基础题
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3370 | [仅含置位位的最小整数](https://leetcode.cn/problems/smallest-number-with-all-set-bits/) | 1199 |
| 3827 | [统计单比特整数](https://leetcode.cn/problems/count-monobit-integers/) | — |
| 3226 | [使两个整数相等的位更改次数](https://leetcode.cn/problems/number-of-bit-changes-to-make-two-integers-equal/) | 1247 |
| 1356 | [根据数字二进制下 1 的数目排序](https://leetcode.cn/problems/sort-integers-by-the-number-of-1-bits/) | 1258 |
| 461 | [汉明距离](https://leetcode.cn/problems/hamming-distance/) | 1282 |
| 2220 | [转换数字的最少位翻转次数](https://leetcode.cn/problems/minimum-bit-flips-to-convert-number/) | 1282 |
| 1342 | [将数字变成 0 的操作次数](https://leetcode.cn/problems/number-of-steps-to-reduce-a-number-to-zero/) | — |
| 476 | [数字的补数](https://leetcode.cn/problems/number-complement/) | — |
| 1009 | [十进制整数的反码](https://leetcode.cn/problems/complement-of-base-10-integer/) | — |
| 868 | [二进制间距](https://leetcode.cn/problems/binary-gap/) | 1307 |
| 2917 | [找出数组中的 K-or 值](https://leetcode.cn/problems/find-the-k-or-of-an-array/) | 1389 |
| 693 | [交替位二进制数](https://leetcode.cn/problems/binary-number-with-alternating-bits/) | — |
| 2657 | [找到两个数组的前缀公共数组](https://leetcode.cn/problems/find-the-prefix-common-array-of-two-arrays/) | — |
| 面试题 05.01 | [插入](https://leetcode.cn/problems/面试题-05.01/) | — |
| 231 | [2 的幂](https://leetcode.cn/problems/power-of-two/) | — |
| 342 | [4 的幂](https://leetcode.cn/problems/power-of-four/) | — |
| 191 | [位 1 的个数](https://leetcode.cn/problems/number-of-1-bits/) | — |
| 338 | [比特位计数 也可以 DP](https://leetcode.cn/problems/counting-bits/) | — |
| 2595 | [奇偶位数](https://leetcode.cn/problems/number-of-even-and-odd-bits/) | — |
| 2154 | [将找到的值乘以 2 要求：O(n) 时间，O(1) 空间](https://leetcode.cn/problems/keep-multiplying-found-values-by-two/) | — |
| 3211 | [生成不含相邻零的二进制字符串](https://leetcode.cn/problems/generate-binary-strings-without-adjacent-zeros/) | — |

用位运算代替数组操作：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3690 | [拆分合并数组](https://leetcode.cn/problems/split-and-merge-array-transformation/) | — |

反转二进制数：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 190 | [颠倒二进制位](https://leetcode.cn/problems/reverse-bits/) | — |
| 3750 | [最少反转次数得到翻转二进制字符串](https://leetcode.cn/problems/minimum-number-of-flips-to-reverse-binary-string/) | 1289 |
| 3769 | [二进制反射排序](https://leetcode.cn/problems/sort-integers-by-binary-reflection/) | 1364 |

## 二、异或（XOR）的性质
本质是模 2 剩余系的加法。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1486 | [数组异或操作](https://leetcode.cn/problems/xor-operation-in-an-array/) | 1181 |
| 1720 | [解码异或后的数组](https://leetcode.cn/problems/decode-xored-array/) | 1284 |
| 2433 | [找出前缀异或的原始数组](https://leetcode.cn/problems/find-the-original-array-of-prefix-xor/) | 1367 |
| 1310 | [子数组异或查询](https://leetcode.cn/problems/xor-queries-of-a-subarray/) | 1460 |
| 3702 | [按位异或非零的最长子序列](https://leetcode.cn/problems/longest-subsequence-with-non-zero-bitwise-xor/) | 1489 |
| 2683 | [相邻值的按位异或](https://leetcode.cn/problems/neighboring-bitwise-xor/) | 1518 |
| 1829 | [每个查询的最大异或值](https://leetcode.cn/problems/maximum-xor-for-each-query/) | 1523 |
| 2997 | [使数组异或和等于 K 的最少操作次数](https://leetcode.cn/problems/minimum-number-of-operations-to-make-array-xor-equal-to-k/) | 1525 |
| 1442 | [形成两个异或相等数组的三元组数目](https://leetcode.cn/problems/count-triplets-that-can-form-two-arrays-of-equal-xor/) | 1525 |
| 2429 | [最小异或](https://leetcode.cn/problems/minimize-xor/) | 1532 |
| 2527 | [查询数组异或美丽值](https://leetcode.cn/problems/find-xor-beauty-of-array/) | 1550 |
| 2317 | [操作后的最大异或和](https://leetcode.cn/problems/maximum-xor-after-operations/) | 1679 |
| 2588 | [统计美丽子数组数目](https://leetcode.cn/problems/count-the-number-of-beautiful-subarrays/) | 1697 |
| 2564 | [子字符串异或查询](https://leetcode.cn/problems/substring-xor-queries/) | 1959 |
| 1734 | [解码异或后的排列](https://leetcode.cn/problems/decode-xored-permutation/) | 2024 |
| 2857 | [统计距离为 k 的点对](https://leetcode.cn/problems/count-pairs-of-points-with-distance-k/) | 2082 |
| 1803 | [统计异或值在范围内的数对有多少](https://leetcode.cn/problems/count-pairs-with-xor-in-a-range/) | 2479 |
| 3215 | [用偶数异或设置位计数三元组 II 🔒](https://leetcode.cn/problems/count-triplets-with-even-xor-set-bits-ii/) | — |

另见 数据结构题单 中的「§6.4 0-1 字典树（异或字典树）」。

## 三、与或（AND/OR）的性质
AND 的数越多，结果越小。

OR 的数越多，结果越大。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2980 | [检查按位或是否存在尾随零](https://leetcode.cn/problems/check-if-bitwise-or-has-trailing-zeros/) | 1234 |
| 1318 | [或运算的最小翻转次数](https://leetcode.cn/problems/minimum-flips-to-make-a-or-b-equal-to-c/) | 1383 |
| 2419 | [按位与最大的最长子数组](https://leetcode.cn/problems/longest-subarray-with-maximum-bitwise-and/) | 1496 |
| 2871 | [将数组分割成最多数目的子数组](https://leetcode.cn/problems/split-array-into-maximum-number-of-subarrays/) | 1750 |
| 2401 | [最长优雅子数组](https://leetcode.cn/problems/longest-nice-subarray/) | 1750 |
| 2680 | [最大或值](https://leetcode.cn/problems/maximum-or/) | 1912 |
| 3133 | [数组最后一个元素的最小值](https://leetcode.cn/problems/minimum-array-end/) | 1935 |
| 3108 | [带权图里旅途的最小代价](https://leetcode.cn/problems/minimum-cost-walk-in-weighted-graph/) | 2109 |
| 3117 | [划分数组得到最小的值之和](https://leetcode.cn/problems/minimum-sum-of-values-by-dividing-array/) | 2735 |
| 3125 | [使得按位与结果为 0 的最大数字 🔒](https://leetcode.cn/problems/maximum-number-that-makes-result-of-bitwise-and-zero/) | — |

AND/OR LogTrick
LogTrick 入门教程，包含原地写法，以及额外维护一个列表的写法。

如果你不熟悉原地去重算法，可以看 26. 删除有序数组中的重复项，我的题解。

模板：

// 对于每个右端点 i，计算所有子数组的或值，打印这些或值的分布范围（子数组左端点范围）
// 时间复杂度 O(nlogU)，其中 U = max(nums)
void logTrick(vector<int>& nums) {
    vector<pair<int, int>> or_left; // (子数组或值，最小左端点)
    for (int i = 0; i < nums.size(); i++) {
        int x = nums[i];
        // 计算以 i 为右端点的子数组或值
        for (auto& [or_val, _] : or_left) {
            or_val |= x; // **根据题目修改**
        }
        // x 单独一个数作为子数组
        or_left.emplace_back(x, i);

        // 原地去重（相同或值只保留最左边的）
        int m = 1;
        for (int j = 1; j < or_left.size(); j++) {
            if (or_left[j].first != or_left[j - 1].first) {
                or_left[m++] = or_left[j];
            }
        }
        or_left.resize(m);

        cout << i << " " << x << endl;
        for (int k = 0; k < m; k++) {
            auto [or_val, left] = or_left[k];
            int right = k + 1 < m ? or_left[k + 1].second - 1 : i;
            // 对于左端点在 [left, right]，右端点为 i 的子数组，OR 值都是 or_val
            cout << left << " " << right << " " << or_val << endl;
        }
    }
}

int main() {
    vector<int> nums = {4, 2, 1, 5};
    logTrick(nums);
    return 0;
}
注：下面的部分题目，可以用滑动窗口+栈做到更优的 O(n) 时间复杂度，见 原理讲解（方法二）。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3171 | [找到按位或最接近 K 的子数组 例题](https://leetcode.cn/problems/find-subarray-with-bitwise-or-closest-to-k/) | — |
| 1521 | [找到最接近目标值的函数值 同  题，OR 改成 AND](https://leetcode.cn/problems/find-a-value-of-a-mysterious-function-closest-to-target/) | 3171 |
| 3097 | [或值至少为 K 的最短子数组 II](https://leetcode.cn/problems/shortest-subarray-with-or-at-least-k-ii/) | 1891 |
| 2411 | [按位或最大的最小子数组长度](https://leetcode.cn/problems/smallest-subarrays-with-maximum-bitwise-or/) | 1938 |
| 3209 | [子数组按位与值为 K 的数目](https://leetcode.cn/problems/number-of-subarrays-with-and-value-of-k/) | 2050 |
| 898 | [子数组按位或操作](https://leetcode.cn/problems/bitwise-ors-of-subarrays/) | — |

GCD LogTrick
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2447 | [最大公因数等于 K 的子数组数目](https://leetcode.cn/problems/number-of-subarrays-with-gcd-equal-to-k/) | — |
| 2654 | [使数组所有元素变成 1 的最少操作次数](https://leetcode.cn/problems/minimum-number-of-operations-to-make-all-array-elements-equal-to-1/) | — |
| 3605 | [数组的最小稳定性因子](https://leetcode.cn/problems/minimum-stability-factor-of-array/) | 2410 |
| 3574 | [最大子数组 GCD 分数](https://leetcode.cn/problems/maximize-subarray-gcd-score/) | — |
| 2941 | [子数组的最大 GCD-Sum 🔒](https://leetcode.cn/problems/maximum-gcd-sum-of-a-subarray/) | — |

## 四、拆位 / 贡献法
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 477 | [汉明距离总和](https://leetcode.cn/problems/total-hamming-distance/) | — |
| 1863 | [找出所有子集的异或总和再求和](https://leetcode.cn/problems/sum-of-all-subset-xor-totals/) | — |
| 2425 | [所有数对的异或和](https://leetcode.cn/problems/bitwise-xor-of-all-pairings/) | 1622 |
| 2275 | [按位与结果大于零的最长组合](https://leetcode.cn/problems/largest-combination-with-bitwise-and-greater-than-zero/) | 1642 |
| 1835 | [所有数对按位与结果的异或和  也有恒等式做法](https://leetcode.cn/problems/find-xor-sum-of-all-pairs-bitwise-and/) | 1825 |
| 3688 | [偶数的按位或运算 看我题解中的思考题（解答见评论）](https://leetcode.cn/problems/bitwise-or-of-even-numbers-in-an-array/) | — |
| 2505 | [所有子序列和的按位或 🔒](https://leetcode.cn/problems/bitwise-or-of-all-subsequence-sums/) | — |

十进制拆位

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3153 | [所有数对中数位不同之和](https://leetcode.cn/problems/sum-of-digit-differences-of-all-pairs/) | 1645 |

## 五、试填法
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 421 | [数组中两个数的最大异或值](https://leetcode.cn/problems/maximum-xor-of-two-numbers-in-an-array/) | — |
| 3806 | [增加操作后最大按位与的结果](https://leetcode.cn/problems/maximum-bitwise-and-after-increment-operations/) | 2259 |
| 2935 | [找出强数对的最大异或值 II](https://leetcode.cn/problems/maximum-strong-pair-xor-ii/) | 2349 |
| 3007 | [价值和小于等于 K 的最大数字](https://leetcode.cn/problems/maximum-number-that-sum-of-the-prices-is-less-than-or-equal-to-k/) | — |
| 3145 | [大数组元素的乘积  类似钱珀瑙恩数](https://leetcode.cn/problems/find-products-of-elements-of-big-array/) | 2859 |
| 3022 | [给定操作次数内使剩余元素的或值最小](https://leetcode.cn/problems/minimize-or-of-remaining-elements-using-operations/) | 2918 |
| 3287 | [求出数组中最大序列值](https://leetcode.cn/problems/find-the-maximum-sequence-value-of-array/) | — |

7

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3344 | [最大尺寸数组 🔒](https://leetcode.cn/problems/maximum-sized-array/) | — |

## 六、恒等式
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1835 | [所有数对按位与结果的异或和](https://leetcode.cn/problems/find-xor-sum-of-all-pairs-bitwise-and/) | 1825 |
| 2354 | [优质数对的数目](https://leetcode.cn/problems/number-of-excellent-pairs/) | 2076 |

## 七、线性基
讲解

模板（最大异或和）：

class XorBasis {
    vector<int> b;

public:
    // n 为值域最大值 U 的二进制长度，例如 U=1e9 时 n=30
    XorBasis(int n) : b(n) {}

    void insert(int x) {
        // 从高到低遍历，保证计算 max_xor 的时候，参与 XOR 的基的最高位（或者说二进制长度）是互不相同的
        for (int i = b.size() - 1; i >= 0; i--) {
            if (x >> i) { // 由于大于 i 的位都被我们异或成了 0，所以 x >> i 的结果只能是 0 或 1
                if (b[i] == 0) { // x 和之前的基是线性无关的
                    b[i] = x; // 新增一个基，最高位为 i
                    return;
                }
                x ^= b[i]; // 保证每个基的二进制长度互不相同
            }
        }
        // 正常循环结束，此时 x=0，说明一开始的 x 可以被已有基表出，不是一个线性无关基
    }

    int max_xor() {
        int res = 0;
        // 从高到低贪心：越高的位，越必须是 1
        // 由于每个位的基至多一个，所以每个位只需考虑异或一个基，若能变大，则异或之
        for (int i = b.size() - 1; i >= 0; i--) {
            res = max(res, res ^ b[i]);
        }
        return res;
    }
};
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3681 | [子序列最大 XOR 值 模板题](https://leetcode.cn/problems/maximum-xor-of-subsequences/) | — |
| 3630 | [划分数组得到最大异或运算和与运算之和](https://leetcode.cn/problems/partition-array-for-maximum-xor-and-and/) | 2744 |

## 八、思维题
贪心、脑筋急转弯等。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 2546 | [执行逐位运算使字符串相等](https://leetcode.cn/problems/apply-bitwise-operations-to-make-strings-equal/) | 1605 |
| 1558 | [得到目标数组的最少函数调用次数](https://leetcode.cn/problems/minimum-numbers-of-function-calls-to-make-target-array/) | 1637 |
| 2571 | [将整数减少到零需要的最少操作数  巧妙结论](https://leetcode.cn/problems/minimum-operations-to-reduce-an-integer-to-0/) | 1649 |
| 3315 | [构造最小位运算数组 II](https://leetcode.cn/problems/construct-the-minimum-bitwise-array-ii/) | 1715 |
| 2568 | [最小无法得到的或值](https://leetcode.cn/problems/minimum-impossible-or/) | 1754 |
| 3644 | [排序排列](https://leetcode.cn/problems/maximum-k-to-sort-a-permutation/) | 1775 |
| 2509 | [查询树中环的长度](https://leetcode.cn/problems/cycle-length-queries-in-a-tree/) | 1948 |
| 2939 | [最大异或乘积](https://leetcode.cn/problems/maximum-xor-product/) | 2128 |
| 2749 | [得到整数零需要执行的最少操作数](https://leetcode.cn/problems/minimum-operations-to-make-the-integer-zero/) | 2132 |
| 2835 | [使子序列的和等于目标的最少操作次数](https://leetcode.cn/problems/minimum-operations-to-form-subsequence-with-target-sum/) | 2207 |
| 2897 | [对数组执行操作使平方和最大](https://leetcode.cn/problems/apply-operations-on-array-to-maximize-sum-of-squares/) | 2301 |
| 810 | [黑板异或游戏](https://leetcode.cn/problems/chalkboard-xor-game/) | 2341 |
| 3064 | [使用按位查询猜测数字 I 🔒](https://leetcode.cn/problems/guess-the-number-using-bitwise-questions-i/) | — |
| 3094 | [使用按位查询猜测数字 II 🔒](https://leetcode.cn/problems/guess-the-number-using-bitwise-questions-ii/) | — |

## 九、其他
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 136 | [只出现一次的数字](https://leetcode.cn/problems/single-number/) | — |
| 260 | [只出现一次的数字 III](https://leetcode.cn/problems/single-number-iii/) | — |
| 2965 | [找出缺失和重复的数字](https://leetcode.cn/problems/find-missing-and-repeated-values/) | — |
| 137 | [只出现一次的数字 II](https://leetcode.cn/problems/single-number-ii/) | — |
| 645 | [错误的集合](https://leetcode.cn/problems/set-mismatch/) | — |
| 371 | [两整数之和](https://leetcode.cn/problems/sum-of-two-integers/) | — |
| 201 | [数字范围按位与](https://leetcode.cn/problems/bitwise-and-of-numbers-range/) | — |
| 2438 | [二的幂数组中查询范围内的乘积](https://leetcode.cn/problems/range-product-queries-of-powers/) | 1610 |
| 1680 | [连接连续二进制数字](https://leetcode.cn/problems/concatenation-of-consecutive-binary-numbers/) | 1630 |
| 1261 | [在受污染的二叉树中查找元素](https://leetcode.cn/problems/find-elements-in-a-contaminated-binary-tree/) | — |
| 89 | [格雷编码](https://leetcode.cn/problems/gray-code/) | — |
| 1238 | [循环码排列](https://leetcode.cn/problems/circular-permutation-in-binary-representation/) | 1775 |
| 3766 | [将数字变成二进制回文数的最少操作](https://leetcode.cn/problems/minimum-operations-to-make-binary-palindrome/) | — |
| 3782 | [交替删除操作后最后剩下的整数](https://leetcode.cn/problems/last-remaining-integer-after-alternating-deletion-operations/) | 2074 |
| 390 | [消除游戏 类似  题](https://leetcode.cn/problems/elimination-game/) | 3782 |
| 982 | [按位与为零的三元组](https://leetcode.cn/problems/triples-with-bitwise-and-equal-to-zero/) | 2085 |
| 3307 | [找出第 K 个字符 II](https://leetcode.cn/problems/find-the-k-th-character-in-string-game-ii/) | 2232 |
| 1611 | [使整数变为 0 的最少操作次数](https://leetcode.cn/problems/minimum-one-bit-operations-to-make-integers-zero/) | 2345 |
| 3514 | [不同 XOR 三元组的数目 II 快速沃尔什变换（FWT）](https://leetcode.cn/problems/number-of-unique-xor-triplets-ii/) | — |
| LCP 81 | [与非的谜题](https://leetcode.cn/problems/lcp-81/) | — |
| 751 | [IP 到 CIDR 🔒](https://leetcode.cn/problems/ip-to-cidr/) | — |
| 3595 | [一次或两次结合 137 和 260 的思路 🔒](https://leetcode.cn/problems/once-twice/) | — |
| 3141 | [最大汉明距离 🔒](https://leetcode.cn/problems/maximum-hamming-distances/) | — |


