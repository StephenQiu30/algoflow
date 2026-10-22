# 归并排序 (Merge Sort)

归并排序（Merge Sort）是建立在归并操作上的一种极其有效的排序算法。该算法是采用分治法（Divide and Conquer）的一个非常典型的应用：将已有序的子序列合并，得到完全有序的序列。

## 1. 原理剖析

归并排序的核心思想是：**“分而治之”**。由于将两个已经有序的数组合并成一个有序数组是非常容易的（只需使用两根指针从头对比到尾即可），归并排序就是不断地将数组对半拆分，直到子数组长度为 1（必然有序），然后再两两向上合并，最终合并为完整的有序大数组。

## 2. 核心步骤

1. **分解（Divide）**：将当前序列一分为二，直到序列长度为 1。
2. **合并（Merge）**：申请额外空间，大小为两个已经排序序列之和。
3. 设定两个指针，最初位置分别为两个已经排序序列的起始位置。
4. 比较两个指针所指向的元素，选择相对较小的元素放入到合并空间，并移动指针到下一位置。
5. 重复步骤 4 直到某一指针达到序列尾，然后将另一序列剩下的所有元素直接复制到合并序列尾。

## 3. 复杂度与稳定性

- **最佳时间复杂度**: $O(n \log n)$。不管原数组是什么样，都会执行均等的划分和合并。
- **最坏时间复杂度**: $O(n \log n)$。
- **平均时间复杂度**: $O(n \log n)$。
- **空间复杂度**: $O(n)$。合并操作需要一个与原数组等大的辅助数组来短暂停留排序好的数据。
- **稳定性**: **稳定**。在合并过程中，如果遇到相等的元素，总是把左边子数组的元素先放入合并数组，因此能完美保留元素的相对顺序。

## 4. 适用场景

- **需要稳定性并且要求高时间效率的场景**：相比于不稳定的快速排序，如果你排序的对象（如数据库对象）带有多个主从键，稳定的归并极其重要（例如 Java 标准库对象排序 `Object[]` 使用了改进的归并 Timsort）。
- **外部排序（External Sorting）**：由于其纯粹的顺序读取和流式合并特性，非常适合处理因数据量过大导致内存无法装下的情况（存放在磁盘）。

## 5. 示例代码

以下是归并排序的 TypeScript 实现示例：

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))

  return merge(left, right)
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = []
  let i = 0,
    j = 0

  // 两个数组共同存活时，比较首部元素移入结果
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      // 等号保证了稳定性
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }

  // 拼接多余的部分
  return result.concat(left.slice(i)).concat(right.slice(j))
}
```
