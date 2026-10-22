# 快速排序 (Quick Sort)

快速排序（Quick Sort）是由计算机顶尖科学家东尼·霍尔（Tony Hoare）所提出的一种极其著名的排序算法。它凭借极高的时间效率在极长一段时间内几乎“统治”了主流编程语言标准库的底层排序实现。

## 1. 原理剖析

快速排序的核心思想是**分治法 (Divide and Conquer)**。通过挑选一个基准点（Pivot），将数列划分为两部分，左半部分一律小于等于基准，右半部分一律大于等于基准，由此一次性将基准元素安放到了最终准确的位置，然后对左右子数组递归执行相同的操作。

## 2. 核心步骤

1. **挑选基准值**：从数列中挑出一个元素，称为“基准”（pivot）。常见的策略有取第一个、取最后一个、随机取、甚至采取“三数取中平缓法”。
2. **数组分割 (Partition)**：重新排列整个数列，所有比基准值小的元素摆放在基准前面，所有比基准值大的元素摆在基准的后面。在这个分区退出之后，该基准就处于数列的最终位置。
3. **递归排序**：递归地将小于基准值元素的子数列和大于基准值元素的子数列同样进行快速排序操作。

## 3. 复杂度与稳定性

- **最佳时间复杂度**: $O(n \log n)$。当每次分区都能完美地将数组平分时，递归树的深度为 $\log n$，每层的处理耗时 $O(n)$。
- **最坏时间复杂度**: $O(n^2)$。当数组已经有序，且总是选择最后/第一个元素作为基准导致极度不平衡的分区时退化。但在随机基准或三数取中的优化下极难出现这种糟糕情况。
- **平均时间复杂度**: $O(n \log n)$。且由于其缓存命中率高，它通常是实践中最快的比较排序。
- **空间复杂度**: $O(\log n)$ ~ $O(n)$。基于递归调用栈需要的深度空间。
- **稳定性**: **不稳定**。基准元素与远距离元素的跨步交换会破坏相同元素的原本顺序。

## 4. 适用场景

- **通用场景下的大规模数据排序**：无论数据是随机分散、逆序，快排（往往指其优化混合版如 IntroSort）总体性能通常最卓越。C++ 的 `std::sort` 即采用了基于快排衍生出的内省排序。
- **内存受限的大数据排序**：不同于归并排序需要 $O(n)$ 级别的内存拷贝，快排是原地发生的算法，缓存友好（Cache Friendly）的横向扫描极大提高了现代 CPU 执行指令的速度。

## 5. 示例代码

以下是采用双指针交换法（Hoare 分区方案的一个变体）的快速排序 TypeScript 实现：

```typescript
function quickSort(arr: number[], left = 0, right = arr.length - 1): number[] {
  if (left < right) {
    const pivotIndex = partition(arr, left, right)
    // 递归处理左右两部分
    quickSort(arr, left, pivotIndex - 1)
    quickSort(arr, pivotIndex + 1, right)
  }
  return arr
}

function partition(arr: number[], left: number, right: number): number {
  // 选用最右侧元素作为基准点
  const pivot = arr[right]
  let i = left - 1 // 记录小于基准值的边界位置

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      i++
      // 将比基准值小的数换到左边
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }

  // 将基准值放置到分割点中央
  ;[arr[i + 1], arr[right]] = [arr[right], arr[i + 1]]
  return i + 1
}
```
