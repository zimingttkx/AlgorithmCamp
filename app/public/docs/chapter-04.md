# Chapter 04 · 网格图

> 来源：[灵茶山艾府题单](https://leetcode.cn/circle/discuss/YiXPXW/)

---

## 一、网格图 DFS
适用于需要计算连通块个数、大小的题目。

部分题目做法不止一种，也可以用 BFS 或并查集解决。

二叉树 DFS 与网格图 DFS 的区别：

二叉树	网格图
递归入口	根节点	网格图的某个格子
递归方向	左儿子和右儿子	一般为左右上下的相邻格子
递归边界	空节点（或者叶节点）	出界、遇到障碍或者已访问
模板（计算每个连通块的大小）：

constexpr int DIRS[4][2] = {{0, -1}, {0, 1}, {-1, 0}, {1, 0}}; // 左右上下

// 返回网格图 grid 每个连通块的大小
// 时间复杂度 O(mn)
vector<int> dfsGrid(vector<vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector vis(m, vector<int8_t>(n));

    // 返回当前连通块的大小
    auto dfs = [&](this auto&& dfs, int i, int j) -> int {
        vis[i][j] = true;
        int size = 1;
        for (auto [dx, dy] : DIRS) {
            int x = i + dx, y = j + dy;
            // 这里 grid[x][y] == '.' 根据题意修改
            if (0 <= x && x < m && 0 <= y && y < n && grid[x][y] == '.' && !vis[x][y]) {
                size += dfs(x, y);
            }
        }
        return size;
    };

    vector<int> comp_size;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] != '.' || vis[i][j]) { // grid[i][j] != '.' 根据题意修改
                continue;
            }
            int size = dfs(i, j);
            comp_size.push_back(size);
        }
    }
    return comp_size;
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 200 | [岛屿数量](https://leetcode.cn/problems/number-of-islands/) | — |
| 695 | [岛屿的最大面积](https://leetcode.cn/problems/max-area-of-island/) | — |
| 3619 | [总价值可以被 K 整除的岛屿数目](https://leetcode.cn/problems/count-islands-with-total-value-divisible-by-k/) | 1461 |
| 2658 | [网格图中鱼的最大数目](https://leetcode.cn/problems/maximum-number-of-fish-in-a-grid/) | 1490 |
| 面试题 16.19 | [水域大小](https://leetcode.cn/problems/面试题-16.19/) | — |

LCS 03. 主题空间
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 463 | [岛屿的周长 思维扩展：892. 三维形体的表面积](https://leetcode.cn/problems/island-perimeter/) | — |
| 733 | [图像渲染](https://leetcode.cn/problems/flood-fill/) | — |
| 1034 | [边界着色](https://leetcode.cn/problems/coloring-a-border/) | 1579 |
| 1020 | [飞地的数量](https://leetcode.cn/problems/number-of-enclaves/) | 1615 |
| 2684 | [矩阵中移动的最大次数](https://leetcode.cn/problems/maximum-number-of-moves-in-a-grid/) | 1626 |
| 1254 | [统计封闭岛屿的数目](https://leetcode.cn/problems/number-of-closed-islands/) | 1659 |
| 130 | [被围绕的区域](https://leetcode.cn/problems/surrounded-regions/) | — |
| 1905 | [统计子岛屿](https://leetcode.cn/problems/count-sub-islands/) | 1679 |
| 1391 | [检查网格中是否存在有效路径](https://leetcode.cn/problems/check-if-there-is-a-valid-path-in-a-grid/) | 1746 |
| 417 | [太平洋大西洋水流问题](https://leetcode.cn/problems/pacific-atlantic-water-flow/) | — |
| 529 | [扫雷游戏](https://leetcode.cn/problems/minesweeper/) | — |
| 1559 | [二维网格图中探测环](https://leetcode.cn/problems/detect-cycles-in-2d-grid/) | 1838 |
| 827 | [最大人工岛  变形题见我的题解](https://leetcode.cn/problems/making-a-large-island/) | 1934 |
| LCP 63 | [弹珠游戏 也可以不用 DFS](https://leetcode.cn/problems/lcp-63/) | — |
| 305 | [岛屿数量 II 🔒](https://leetcode.cn/problems/number-of-islands-ii/) | — |
| 2061 | [扫地机器人清扫过的空间个数也可以迭代 🔒](https://leetcode.cn/problems/number-of-spaces-cleaning-robot-cleaned/) | — |
| 2852 | [所有单元格的远离程度之和 🔒](https://leetcode.cn/problems/sum-of-remoteness-of-all-cells/) | — |
| 489 | [扫地机器人 🔒](https://leetcode.cn/problems/robot-room-cleaner/) | — |

思维扩展：

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1970 | [你能穿过矩阵的最后一天  做法不止一种](https://leetcode.cn/problems/last-day-where-you-can-still-cross/) | 2124 |

## 二、网格图 BFS
适用于需要计算最短距离（最短路）的题目。

DFS 是不撞南墙不回头；BFS 是往水塘中扔石头（起点），荡起一圈圈涟漪（先访问近的，再访问远的）。

模板（单源最短路）：

constexpr int DIRS[4][2] = {{0, -1}, {0, 1}, {-1, 0}, {1, 0}}; // 左右上下

// 返回从 (start_x, start_y) 出发，到其余格子的最短距离
// 时间复杂度 O(mn)
vector<vector<int>> bfsGrid(vector<vector<char>>& grid, int start_x, int start_y) {
    int m = grid.size(), n = grid[0].size();
    vector dis(m, vector<int>(n, -1));
    queue<pair<int, int>> q;

    dis[start_x][start_y] = 0;
    q.emplace(start_x, start_y);

    while (!q.empty()) {
        auto [i, j] = q.front();
        q.pop();
        for (auto [dx, dy] : DIRS) {
            int x = i + dx, y = j + dy;
            // 这里 grid[x][y] == '.' 根据题意修改
            if (0 <= x && x < m && 0 <= y && y < n && grid[x][y] == '.' && dis[x][y] < 0) {
                dis[x][y] = dis[i][j] + 1;
                q.emplace(x, y);
            }
        }
    }

    return dis;
}
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1926 | [迷宫中离入口最近的出口](https://leetcode.cn/problems/nearest-exit-from-entrance-in-maze/) | 1638 |
| 1091 | [二进制矩阵中的最短路径](https://leetcode.cn/problems/shortest-path-in-binary-matrix/) | 1658 |
| 1162 | [地图分析](https://leetcode.cn/problems/as-far-from-land-as-possible/) | 1666 |
| 542 | [01 矩阵](https://leetcode.cn/problems/01-matrix/) | — |
| 994 | [腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/) | — |
| 1765 | [地图中的最高点](https://leetcode.cn/problems/map-of-highest-peak/) | 1783 |
| 934 | [最短的桥](https://leetcode.cn/problems/shortest-bridge/) | 1826 |
| 2146 | [价格范围内最高排名的 K 样物品](https://leetcode.cn/problems/k-highest-ranked-items-within-a-price-range/) | 1837 |
| 1293 | [网格中的最短路径](https://leetcode.cn/problems/shortest-path-in-a-grid-with-obstacles-elimination/) | 1967 |
| 909 | [蛇梯棋](https://leetcode.cn/problems/snakes-and-ladders/) | 2020 |
| 1210 | [穿过迷宫的最少移动次数](https://leetcode.cn/problems/minimum-moves-to-reach-target-with-rotations/) | 2022 |
| 675 | [为高尔夫比赛砍树](https://leetcode.cn/problems/cut-off-trees-for-golf-event/) | — |
| 2812 | [找出最安全路径](https://leetcode.cn/problems/find-the-safest-path-in-a-grid/) | 2154 |
| 749 | [隔离病毒](https://leetcode.cn/problems/contain-virus/) | 2277 |
| 1730 | [获取食物的最短路径 🔒](https://leetcode.cn/problems/shortest-path-to-get-food/) | — |
| 286 | [墙与门 🔒](https://leetcode.cn/problems/walls-and-gates/) | — |
| 490 | [迷宫 🔒](https://leetcode.cn/problems/the-maze/) | — |
| 505 | [迷宫 II 🔒](https://leetcode.cn/problems/the-maze-ii/) | — |
| 499 | [迷宫 III 🔒](https://leetcode.cn/problems/the-maze-iii/) | — |
| 317 | [离建筑物最近的距离 🔒](https://leetcode.cn/problems/shortest-distance-from-all-buildings/) | — |
| 2814 | [避免淹死并到达目的地的最短时间 🔒](https://leetcode.cn/problems/minimum-time-takes-to-reach-destination-without-drowning/) | — |

## 三、网格图 0-1 BFS
边权只有 0 和 1 的题目，也可以用 BFS 做。

| 题号 | 题目 | 难度分 |
|------|------|--------|
| 3286 | [穿越网格图的安全路径](https://leetcode.cn/problems/find-a-safe-walk-through-a-grid/) | — |
| 2290 | [到达角落需要移除障碍物的最小数目](https://leetcode.cn/problems/minimum-obstacle-removal-to-reach-corner/) | 2138 |
| 1368 | [使网格图至少有一条有效路径的最小代价](https://leetcode.cn/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/) | 2069 |
| 3552 | [网格传送门旅游](https://leetcode.cn/problems/grid-teleportation-traversal/) | 2036 |
| 1824 | [最少侧跳次数](https://leetcode.cn/problems/minimum-sideway-jumps/) | — |
| LCP 56 | [信物传送](https://leetcode.cn/problems/lcp-56/) | — |

## 四、网格图 Dijkstra
见 图论题单 中的「§3.1 单源最短路：Dijkstra 算法」，我标记了网格图的题目。

## 五、综合应用
| 题号 | 题目 | 难度分 |
|------|------|--------|
| 1631 | [最小体力消耗路径](https://leetcode.cn/problems/path-with-minimum-effort/) | 1948 |
| 778 | [水位上升的泳池中游泳](https://leetcode.cn/problems/swim-in-rising-water/) | 2097 |
| 329 | [矩阵中的最长递增路径](https://leetcode.cn/problems/longest-increasing-path-in-a-matrix/) | — |
| 3568 | [清理教室的最少移动  状压 BFS（分层图最短路）](https://leetcode.cn/problems/minimum-moves-to-clean-the-classroom/) | 2143 |
| 1036 | [逃离大迷宫](https://leetcode.cn/problems/escape-a-large-maze/) | 2165 |
| 864 | [获取所有钥匙的最短路径  状压 BFS（分层图最短路）](https://leetcode.cn/problems/shortest-path-to-get-all-keys/) | 2259 |
| 1263 | [推箱子](https://leetcode.cn/problems/minimum-moves-to-move-a-box-to-their-target-location/) | 2297 |
| 2258 | [逃离火灾](https://leetcode.cn/problems/escape-the-spreading-fire/) | 2347 |
| 2556 | [二进制矩阵中翻转最多一次使路径不连通](https://leetcode.cn/problems/disconnect-path-in-a-binary-matrix-by-at-most-one-flip/) | 2369 |
| 2577 | [在网格图中访问一个格子的最少时间](https://leetcode.cn/problems/minimum-time-to-visit-a-cell-in-a-grid/) | 2382 |
| 2617 | [网格图中最少访问的格子数](https://leetcode.cn/problems/minimum-number-of-visited-cells-in-a-grid/) | 2582 |
| LCP 13 | [寻宝 状压 DP](https://leetcode.cn/problems/lcp-13/) | — |
| LCP 31 | [变换的迷宫](https://leetcode.cn/problems/lcp-31/) | — |
| LCP 45 | [自行车炫技赛场](https://leetcode.cn/problems/lcp-45/) | — |
| LCP 75 | [传送卷轴](https://leetcode.cn/problems/lcp-75/) | — |
| 1778 | [未知网格中的最短路径 🔒](https://leetcode.cn/problems/shortest-path-in-a-hidden-grid/) | — |
| 694 | [不同岛屿的数量 🔒](https://leetcode.cn/problems/number-of-distinct-islands/) | — |
| 711 | [不同岛屿的数量 II 🔒](https://leetcode.cn/problems/number-of-distinct-islands-ii/) | — |
| 1102 | [得分最高的路径 🔒](https://leetcode.cn/problems/path-with-maximum-minimum-value/) | — |


