---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

IOMesh can be installed on the Kubernetes platform or the Redhat Openshift Container platform. Before installing and deploying IOMesh, verify the following requirements.

### Cluster Requirements

A Kubernetes cluster or an OpenShift cluster, either of which should have at least 3 worker nodes. The Kubernetes version should be between 1.17 and 1.25, or the OpenShift version between 4.0 and 4.11.

### Hardware Requirements 

Verify that each worker node meets the following configuration requirements.

**CPU**
- CPU architecture: Intel x86_64, Hygon x86_64, or Kunpeng AArch64
- At least 8 cores for each worker node.

**Memory**
- At least 16 GB on each worker node.

**Store Core**
- SAS HBA cards or RAID cards that support pass-through mode (JBOD). 存储控制器也是对 CPU 的要求？

**OS Disk**
- SSD with 100GB free space in /opt directory. (SSD 数量)

**Data & Cache Disk**

Depends on whether you choose tiered storage or non-tiered storage.

Tiered Storage

使用高速介质做缓存，低速介质做容量。“高速”和“低速”是相对概念，例如将速度更快的 NVMe SSD 作为缓存盘，充分发挥硬件性能，而速度稍低的 SATA SSD 或者 HDD 作为数据盘。使用分层模式时，可以选择混闪配置或者全闪配置。

|Deployment Mode| Disk Requirements|
|---|---|
|All-Flash Mode|XXXXX|
|Hybrid Mode| XXXX|

Non-Tiered Storage

不设置缓存盘。除了含有系统分区的物理盘，剩余的所有物理盘都作为数据盘使用。存储不分层模式只能使用全闪配置。

|Deployment Mode| Disk Requirements|
|---|---|
|Hybrid Mode| XXXXX|

**NIC**
- At least one 10/25 GbE NIC for each worker node.

### Network Requirements
- All worker nodes must be connected to the L2 layer network.
- The ping latency of the IOMesh storage network is below 1 ms.

### System Space Requirements 
在 OS disk 已经说明，是否可以删掉
Verify that there is at least 100 GB of disk space in the `/opt` directory on each worker node to store IOMesh metadata.


